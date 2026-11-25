# 황호순 · ML / AI 포트폴리오

세 프로젝트를 함교 창 너머에서 고를 수 있는 정적 사이트입니다. 행성을 고르면 전경으로 다가오고, 별 지도에 떠 있는 브리핑에서 담당 역할과 실제 서비스 화면을 바로 읽을 수 있습니다. 창업ON의 3차·4차는 한 버튼 안의 이중 행성입니다. 헤더의 이력서는 현재 페이지 위에 열립니다.

## 로컬 실행

Python 3.11 이상과 uv를 사용합니다. 프로젝트 루트에서 실행하세요.

```powershell
uv sync --locked
uv run --locked python scripts/build.py
uv run --locked python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

미리보기 주소는 <http://127.0.0.1:4173/>입니다. 원본을 수정한 뒤 빌드를 다시 실행하고 브라우저를 새로고침하면 됩니다.

## 콘텐츠 수정

- `content/profile.toml`에서 이름, 직무, GitHub와 이력서 기술 목록을 편집합니다.
- `content/projects/*.toml`에서 프로젝트 소개, 역할, 기술 결정, 결과와 출처를 편집합니다. 홈·상세·이력서가 같은 프로젝트 원본을 읽습니다.
- 실제 서비스 화면과 로고는 `assets/projects/<slug>/`에 둡니다. TOML의 `media`에서 원본의 크기, 대체 텍스트, 캡션, 출처를 지정합니다. 화면 또는 로고가 없을 때는 해당 키를 생략하면 그 영역이 접힙니다.
- 함교·우주·행성 텍스처는 `assets/bridge/`, 항로는 `templates/components/routes.svg`에 있습니다. `templates/components/hud-ring.svg`는 추적 표시가 두 반원을 이어서 한 바퀴 돌도록 행성 앞뒤에 그립니다. `assets/js/bridge.js`와 `assets/css/bridge.css`가 선택과 궤도 이동을 제어합니다. `assets/js/scene-motion.js`는 표면 지도를 Canvas 2D로 구체에 투영해 자전시킵니다. 화면의 모션 버튼으로 자전, 별의 흐름, 링을 함께 멈출 수 있습니다.

## 고정 상세 주소

| 프로젝트 | 경로 |
| --- | --- |
| VISHUE | `/projects/vishue/` |
| 창업ON · 3차와 4차 | `/projects/changup-on/` |
| 두잎 | `/projects/duip/` |

각 경로에는 자체 `index.html`이 있습니다. 이력서와 외부 문서에서 해당 주소를 직접 연결할 수 있습니다.

## 구조 레퍼런스

공통 틀과 페이지 템플릿 분리는 [Pelican](https://github.com/getpelican/pelican/tree/HEAD/pelican/themes/simple/templates), 템플릿과 브라우저 자산 구분은 [MkDocs](https://github.com/mkdocs/mkdocs/tree/HEAD/mkdocs/themes/mkdocs)를 참고했습니다. 프로젝트 원본을 빌드 스크립트와 나누는 구성은 [simonw/til](https://github.com/simonw/til)을 참고했습니다.

## 자료 출처

프로젝트별 팀 저장소와 공개 시연, 실험 조건은 각 상세와 프로젝트 TOML에 연결했습니다. VISHUE의 제품 추천 화면은 팀 검증용 테스트 데이터입니다. 재현율 비교는 같은 사람 단위 테스트 분할에서 모공 전처리 조건을 바꾼 실험입니다.

함교 프레임과 창밖 풍경은 ImageGen으로 개별 제작했습니다. 행성 표면은 Solar System Scope / INOVE의 Moon·Venus Surface·Mercury 지도를 축소·재채색했습니다. 각 페이지 하단의 이미지 출처에서 원문과 라이선스를 볼 수 있습니다. Barlow의 배포 라이선스는 `assets/fonts/OFL-Barlow.txt`에 포함되어 있습니다.
