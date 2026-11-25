"""Build the portfolio from its project records, templates, and local assets."""

import math
import shutil
import tempfile
import tomllib
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape


ROOT = Path(__file__).resolve().parents[1]
# The two screen-space axes of the inclined course, in percentages of the map.
# SVG draws a transformed unit circle. HTML uses that same matrix for its centres.
ORBIT = {"cx": 53.5, "cy": 36.0, "rx": 36.8, "ry": 19.8, "tilt_y": 5.5}


def orbit_point(angle: float) -> tuple[float, float]:
    theta = math.radians(angle)
    # Preserve the foreshortening of the previous camera: a 120-degree world
    # turn covers a different apparent angle on the near and far arcs.
    phase = math.atan2(math.sqrt(2.4) * math.sin(theta), 1.7 * math.cos(theta) - 0.7)
    u, v = math.sin(phase), math.cos(phase)
    return ORBIT["cx"] + ORBIT["rx"] * u, ORBIT["cy"] + ORBIT["tilt_y"] * u + ORBIT["ry"] * v


def read_toml(path: Path) -> dict:
    with path.open("rb") as source:
        return tomllib.load(source)


def load_projects() -> list[dict]:
    projects = []
    for source in (ROOT / "content/projects").glob("*.toml"):
        project = read_toml(source)
        slug = source.stem
        for field in ("order", "name", "stage", "summary", "role", "contribution",
                      "problem", "decision", "result", "stack", "links"):
            if not project.get(field):
                raise ValueError(f"{source.name}: missing {field}")
        media = project.get("media", {})
        for key in ("image", "logo"):
            asset = media.get(key)
            if asset and not (ROOT / "assets/projects" / slug / asset).is_file():
                raise ValueError(f"{source.name}: missing {key} asset {asset}")
        if media.get("image") and not all(media.get(k) for k in ("alt", "caption", "source", "width", "height")):
            raise ValueError(f"{source.name}: the service image needs dimensions, a caption, alt text and a source")
        projects.append({**project, "slug": slug, "media": media})
    projects.sort(key=lambda project: project["order"])
    if [p["slug"] for p in projects] != ["vishue", "changup-on", "duip"]:
        raise ValueError("Expected the three project records in map order")
    for index, project in enumerate(projects):
        angle = index * 360 / len(projects)
        depth = math.cos(math.radians(angle))
        project["angle"] = angle
        project["scale"] = round(1 / (2.4 - 1.4 * depth), 5)
        x, y = orbit_point(angle)
        project["x"], project["y"] = round(x, 4), round(y, 4)
    return projects


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
        (stage / "index.html").write_text(
            env.get_template("index.html").render(root="./"), encoding="utf-8"
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
