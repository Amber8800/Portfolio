"""Build the portfolio from its project records, templates, and local assets."""

import math
import random
import shutil
import tempfile
import tomllib
from hashlib import sha256
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape


ROOT = Path(__file__).resolve().parents[1]
# Screen coordinates are percentages of the hologram. The orbits share a tilted plane.
ORBIT = {
    "cx": 55, "cy": 52,
    "rx": 98, "tilt_y": 47, "front_x": 21, "ry": 60,
    "depth_per_radius": 1.4,
}


def read_toml(path: Path) -> dict:
    with path.open("rb") as source:
        return tomllib.load(source)


def load_projects() -> list[dict]:
    projects = []
    for source in (ROOT / "content/projects").glob("*.toml"):
        project = read_toml(source)
        slug = source.stem
        for field in ("order", "name", "summary", "role", "contribution",
                      "problem", "decision", "result", "stack", "links"):
            if not project.get(field):
                raise ValueError(f"{source.name}: missing {field}")
        orbit = project["orbit"]
        if not all(math.isfinite(orbit[k]) and orbit[k] > 0 for k in ("radius", "focus_zoom")):
            raise ValueError(f"{source.name}: orbital radius and zoom must be positive")
        media = project.get("media", {})
        for key in ("image", "logo"):
            asset = media.get(key)
            if asset and not (ROOT / "assets/projects" / slug / asset).is_file():
                raise ValueError(f"{source.name}: missing {key} asset {asset}")
        if media.get("image") and not all(media.get(k) for k in ("alt", "caption", "source", "width", "height")):
            raise ValueError(f"{source.name}: the service image needs dimensions, a caption, alt text and a source")
        # The camera looks down the chosen radius. The gap to the planet
        # sets its apparent diameter when it reaches the front of the orbit.
        camera_distance = ORBIT["depth_per_radius"] * orbit["radius"] + 1 / orbit["focus_zoom"]
        projects.append({**project, "slug": slug, "media": media, "camera_distance": camera_distance})
    projects.sort(key=lambda project: project["order"])
    if [p["slug"] for p in projects] != ["vishue", "changup-on", "duip"]:
        raise ValueError("Expected the three project records in map order")
    distance = projects[0]["camera_distance"]
    target = projects[0]["orbit"]["radius"]
    depth = ORBIT["depth_per_radius"]
    if min(p["camera_distance"] for p in projects) <= depth * max(p["orbit"]["radius"] for p in projects):
        raise ValueError("Every camera position must leave the nearest orbit in front of the lens")
    for index, project in enumerate(projects):
        radius = project["orbit"]["radius"]
        project["angle"] = index * 360 / len(projects)
        theta = math.radians(project["angle"])
        u, v = radius * math.sin(theta), radius * math.cos(theta)
        gap = distance - depth * v
        project["scale"] = round(1 / gap, 6)
        project["x"] = round(ORBIT["cx"] + (ORBIT["rx"] * u + ORBIT["front_x"] * (v - target)) / gap, 5)
        project["y"] = round(ORBIT["cy"] + (ORBIT["tilt_y"] * u + ORBIT["ry"] * (v - target)) / gap, 5)
        # First paint uses the same perspective ellipse as the live camera.
        near_gap, far_gap = distance - depth * radius, distance + depth * radius
        near, far = (radius - target) / near_gap, (-radius - target) / far_gap
        project["ellipse"] = (radius / math.sqrt(near_gap * far_gap), (near - far) / 2, (near + far) / 2)
    return projects


def versioned_assets(directory: Path, projects: list[dict]) -> dict[str, str]:
    paths = [*directory.glob("css/*.css"), *directory.glob("js/*.js")]
    paths.extend(directory / "bridge" / f"{project['slug']}.webp" for project in projects)
    urls = {}
    for path in paths:
        name = path.relative_to(directory).as_posix()
        version = sha256(path.read_bytes()).hexdigest()[:12]
        urls[name] = f"assets/{name}?v={version}"
    return urls


def build() -> None:
    env = Environment(
        loader=FileSystemLoader(ROOT / "templates"),
        autoescape=select_autoescape(("html", "svg")),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    projects = load_projects()
    profile = read_toml(ROOT / "content/profile.toml")
    env.globals.update(profile=profile, projects=projects, orbit=ORBIT)
    destination = ROOT / "dist"
    # Render and validate the entire next version before replacing a working build.
    with tempfile.TemporaryDirectory(prefix=".portfolio-build-", dir=ROOT) as scratch:
        stage = Path(scratch) / "site"
        shutil.copytree(ROOT / "assets", stage / "assets")
        env.globals["assets"] = versioned_assets(stage / "assets", projects)
        sky = random.Random(34)
        star_sizes = [round(sky.uniform(1.7, 3.2), 2) for _ in range(34)]
        (stage / "index.html").write_text(
            env.get_template("index.html").render(root="./", star_sizes=star_sizes), encoding="utf-8"
        )
        for project in projects:
            directory = stage / "projects" / project["slug"]
            directory.mkdir(parents=True)
            (directory / "index.html").write_text(
                env.get_template("project.html").render(project=project, root="../../"),
                encoding="utf-8",
            )
        previous = Path(scratch) / "previous"
        if destination.exists():
            destination.rename(previous)
        try:
            stage.rename(destination)
        except OSError:
            if previous.exists() and not destination.exists():
                previous.rename(destination)
            raise
    print(f"Built home and {len(projects)} project pages in {destination}")


if __name__ == "__main__":
    build()
