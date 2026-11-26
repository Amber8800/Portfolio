# 함교 포트폴리오 검수

## 비교 화면

스타크래프트 2의 목적지 선택 화면과 함교 홈의 VISHUE 선택 상태를 1780×1003에서 비교했습니다. 두 캡처 모두 원본 1픽셀이 CSS 1픽셀에 해당하는 크기로 맞췄습니다. 대조 이미지의 윗줄은 전체 구도, 아랫줄은 선택 이름과 브리핑, 행성 링입니다. 금속 프레임과 앰버 강조색의 기준은 최초 A안입니다. [스타크래프트 2 참고 화면](C:/Users/silve/AppData/Local/Temp/codex-clipboard-e430e964-6fa1-4a7a-b0a2-e53187b88c40.png) · [A안](C:/Users/silve/AppData/Local/Temp/codex-clipboard-c3b4a9c4-70bf-4155-acaf-797ff4881a88.png) · [구현 화면](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/hud-desktop.jpg) · [전체와 세부 대조](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/hud-reference.webp)

## 수정과 재검수

초기 단일 궤도 시안에서는 기울어진 궤도의 양끝을 금속 창틀 뒤로 보내고 행성 표면의 좌표 격자와 하단 콘솔의 투사광을 비교했습니다. 이후 같은 창 안에 반경이 다른 세 궤도를 배치했습니다. [초기 궤도 변경 전후 비교](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/hologram-compare.webp)

| 항목 | 확인한 결과 |
| --- | --- |
| 구도 | 1536×960에서 선택한 프로젝트의 중심은 (837, 455)에 놓입니다. 콘솔 계기 중앙의 발광점과 앞쪽 상판이 홀로그램의 투사 위치를 보여줍니다. [외곽·안쪽 시점 비교](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/console-orbits-comparison.webp) |
| 행성 교체 | 1.5초 카메라 이동에서 시선, 피사체 거리와 구도를 함께 보간합니다. VISHUE에서 두잎에 도착하면 외곽 궤도의 투영 폭이 1,474px에서 4,137px, 가운데 궤도는 1,102px에서 2,125px로 커집니다. 시야 밖으로 넘어간 부분을 포함한 전체 곡선의 폭입니다. 중간에 다시 선택했을 때 시선과 거리가 이어지는 것을 확인했습니다. [왕복 전환 녹화](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/console-orbits-flight.webp) |
| 브리핑 교체 | 카메라 이동 중에는 선택 링을 숨깁니다. 행성이 도착하면 HUD의 두 호가 0.64초 동안 오른쪽에서 왼쪽으로 그려집니다. 두 호가 만난 지점에서 사선이 0.24초, 이어서 제목선이 0.36초 뻗은 다음 타이핑이 시작됩니다. 글자의 80%가 써지면 서비스 화면과 상세 버튼이 함께 한 번 깜빡입니다. 그전에도 상단 바로가기로 선택한 프로젝트를 열 수 있습니다. 링을 그리는 도중 키보드로 다른 행성을 선택해 마지막 브리핑만 뜨는 것을 확인했습니다. [두잎 전환 녹화](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/hud-acquisition-flight.webp) |
| 글자와 캡처 | 제목, 한 줄 소개, 역할 순으로 크기를 나눴습니다. 좁은 화면에서 여러 줄로 꺾이던 모공 지표의 이름과 비교 조건을 줄이고 실제 캡처를 키웠습니다. 캡처를 선택하면 해당 서비스 화면이 있는 상세 본문으로 이동합니다. |
| 항로와 가림 | 행성 중심은 원근 투영된 궤도 위에 놓입니다. 카메라에 가까운 궤도선과 글로우는 뒤쪽 행성의 표면 앞으로 이어지며, 창업ON의 두 천체는 각각 깊이를 판정합니다. 1.5초 전환 중 0.38초, 0.74초, 1.12초 프레임에서 가까운 선과 가려진 선의 픽셀을 대조했습니다. [가림 변경 전(왼쪽)과 후(오른쪽)](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/orbit-occlusion-crops.jpg) |
| 발광부 | 청백색 중심선을 따라 폭이 다른 두 겹의 빛이 번집니다. 카메라가 접근해도 중심선 굵기는 일정하며, 투사 영역 가장자리에서 글로우가 잦아듭니다. 콘솔 계기에서는 같은 색의 투사광이 위로 퍼집니다. |
| 앰버 링 | 선택한 프로젝트 하나에서 추적 표시가 타원을 9초에 한 바퀴 돌고 안쪽 분할선은 반대 방향으로 흐릅니다. 앞뒤 반원의 위상차를 반 바퀴로 맞췄고, 뒤쪽 호는 천체에 가려집니다. 첫 검수에서 스캔 위치가 단계적으로 바뀌던 SVG 보간을 수정한 후, 브라우저에서 연속적인 중간 위치와 정지 시 같은 위치가 유지되는 것을 확인했습니다. |
| 자전과 배경 | 구체의 지형과 별 배경은 시간에 따라 움직이고, 표면을 비추는 빛과 함교는 고정됩니다. 1280×720에서 재생 중 같은 표면 구역의 픽셀이 변했고 멈춘 두 화면은 일치했습니다. |
| 프로젝트색 | VISHUE는 실제 서비스 버튼의 버건디 `#782c4c`, 창업ON은 로고의 파랑 `#2f7bf0`과 초록 `#34b36a`를 채색에 사용했습니다. 두잎 표면에는 짙은 상록 숲, 강 하구, 남색 바다가 보입니다. 회전용 캔버스와 정적 이미지에서 각각 색을 확인했습니다. |
| 창밖과 콘솔 | 별과 성운만 창밖에 보입니다. 하단 콘솔을 세로로 1.48배 펼쳐 상판을 더 드러냈습니다. 방향 바늘은 선택을 따라가며, 카메라 이동 전후에 측정한 투사기 위치는 같았습니다. |

[링 모션 4초 발췌](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/hud-ring-motion.webp) · [창업ON 이중 행성](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/hud-binary.jpg)

## 동작 검증

- 함교의 상세 버튼과 이동 중 바로가기는 콘솔 위에 남청색 브리핑을 띄웁니다. 제목 옆에 지도와 같은 행성 지형과 앰버 링이 보이고, 창업ON에는 두 천체가 표시됩니다. 세 문서의 본문과 자료를 각 고정 상세 주소와 대조했습니다. 360px에서도 본문만 스크롤되고 닫기 버튼은 보입니다. Esc와 브라우저 뒤로가기는 원래 선택으로, 이력서에서 연 문서는 해당 프로젝트 링크로 돌아갑니다. [데스크톱 브리핑](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/console-brief-duip.png) · [모바일 브리핑](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/console-brief-mobile.png)
- 일반 모션 설정에서 첫 화면과 선택 후 대기 구간의 천체 중심을 각각 두 번 측정했습니다. 창업ON의 두 천체를 포함한 네 중심 좌표가 모두 같았고 행성 표면의 픽셀은 자전하면서 변했습니다. 전환 도중 다른 프로젝트를 고르면 현재 위치와 배율에서 다음 전환이 시작됩니다.
- 마우스로 창업ON을 선택한 직후 Space로 두잎을 선택해 브리핑, 상세 링크, 링이 모두 두잎으로 바뀌는 것을 확인했습니다.
- 360px 뷰포트에서 목록 순서와 각 버튼 위치가 선택 전후 같았고 가로 넘침은 0이었습니다. 900×650에서는 스크롤 없이 브리핑과 상세 버튼이 보였습니다. [모바일 화면](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/hud-mobile.jpg)
- 모션 멈춤 버튼으로 표면, 별, 링이 함께 멈췄습니다. 모션 감소 환경에서는 부팅, 자전, 별 흐름, 링 스캔과 점등이 생략되고 궤도 전환 시간은 0초였습니다.
- 모바일 이력서에서 두잎 상세를 직접 열어 제목과 역할을 확인했습니다. 홈과 세 상세 페이지가 참조하는 로컬 주소 23개가 HTTP 200을 반환했습니다. 스크립트 비활성용 탐색에는 세 상세 링크가 모두 있고, 상세 페이지는 함교 스크립트를 로드하지 않습니다.
- 함교 홈과 선택 동작을 검수한 미리보기의 콘솔에서 오류와 경고는 관측되지 않았습니다.
- 900px 창에서 세 프로젝트를 선택해 상세 버튼이 보이는지 확인했습니다. 360px에서 키보드 선택 전후 목록 위치가 같았습니다. 시스템 모션 감소와 수동 멈춤 상태에서는 카메라가 곧바로 목적지에 도착합니다. [900px 화면](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/console-orbits-900.jpg) · [360px 목록](C:/Users/silve/.codex/visualizations/2026/11/25/01a212bf-e65d-76e1-9508-807c76653059/portfolio-qa/console-orbits-mobile.jpg)

<details>
<summary>두잎 숲 행성의 ImageGen 프롬프트</summary>

Create a seamless 2:1 equirectangular albedo texture for a forest planet. Fill the rectangle edge to edge like a cloud-light satellite mosaic. Broad emerald and leaf-green forest continents cover about 70% of the world; branching rivers, mossy highlands, indigo seas and jade estuaries read clearly on a small globe. Place forested coasts in both hemispheres, with dark ocean wrapping across the left/right seam. Even illumination, irregular organic geography and restrained natural colors. No sphere, horizon, space, borders, text or cast shadows.

함교에서 사용하는 표면 지도는 [두잎 텍스처](assets/bridge/duip.webp)에 768×384 WebP로 저장했습니다.

</details>

final result: passed
