# 웹 마작 게임 기획 :mahjong:

만들자, 게임!

[TOC]

## 기본정보

제목: 타노시쿠 마장 (Tanosiku Mahjong)

장르: 보드게임 (마작)

플랫폼: 웹 (Node JS)

## 컨셉

미정

## 페이지 구성

1. 메인 (index)
   - 타이틀 로고
   - 닉네임 입력란
   - 접속 버튼
   - 하단 게임 정보
2. 로비 (lobby)
   - 방
   - 캐릭터
3. 게임방 (game/방넘버)
   - 게임 정보 (가운데)
   - 플레이어 정보
   - 버림패
   - 손패
   - 운패

## 기능

#### 메인 (index)

- 닉네임 설정 후 입장 :heavy_check_mark:

#### 로비 (lobbgy)

- 방탐색 :heavy_check_mark:
  - 방이름 ​:heavy_check_mark:​
  - 비밀방 여부 ​:heavy_check_mark:​
  - 현재 입장한 인원 수 ​:heavy_check_mark:​
- 새로운 방 만들기 (비밀방 가능) ​:heavy_check_mark:​
  - 방 이름 ​:heavy_check_mark:​
  - 비밀번호 (옵션) ​:heavy_check_mark:​
- 본인 정보 확인 ​:heavy_check_mark:​

#### 게임 (game/방넘버)

- 마작의 기본 기능 - 4인 리치 마작
  - 패산 쌓기
  - 주사위 굴리기
  - 동서남북 정하기
  - 왕패 떼기
  - 손패 떼기
  - 쯔모, 기리
  - 치, 퐁, 깡
  - 도라 뒤집기
  - 영상패 쯔모
  - 론(챵깡), 쯔모
  - 점수 계산
  - 점수 이동
  - 현재 정보
    - 남은 패 수
    - 손패
    - 점수, 가(家)
  - 연장 기능
- 추가 기능
  - 버린패 확인
  - 샹텐 확인 기능
  - 쯔모 기리 확인 기능
  - CPU 대전


- 게임 외 본인 정보
  - 닉네임
  - 프로필 사진 (우선 기본 이미지 중 선택)
- 게임 옵션
  - 사운드 조절
  - 방 나가기
  - 추가 기능 설정

## 개발 계획

|          날짜 | 작업             |
| ----------: | :------------- |
| 1.25 - 1.26 | 기본 구조 구상 및 정리  |
|        1.26 | 서버 준비          |
|        1.27 | 메인 페이지         |
| 1.28 - 1.29 | 로비 페이지         |
| 1.30 - 1.31 | 마작 기본기능 클래스 구현 |
|         2.1 | 게임 페이지 UI 구성   |
|   2.2 - 2.3 | UI - 기능 연결     |
|   2.4 - 2.7 | 게임방 네트워크 작업    |
|  2.8 - 2.10 | UI 디자인 및 다듬기   |
| 2.11 - 2.13 | 기타 추가 기능 구현    |
| 2.14 - 2.17 | 테스팅 및 디버그      |
|    **2.18** | **런칭일**        |

## 유저 시나리오

1. 메인 페이지 진입 :heavy_check_mark:
2. 타이틀 로고가 짠!
3. 아래 닉네임적고 입장 :heavy_check_mark:
4. 로비에서 방 확인 :heavy_check_mark:
5. 방 누르고 입장 (필요시 비밀번호) :heavy_check_mark:
6. 게임 페이지에서 마작 진행
7. 게임 끝나면 결과 확인 후 퇴장
8. 4에서 다시 루프
9. 캐릭터 설정

## 클래스

#### 마작 관련 (Mahjong.js)

- `GameManager`: 전체 돌아가는 판 관리
  - `Player`: 작사 클래스, 점수, 손패등 관리
    - `Hands`: 손패 클래스
  - `Mount`: 패산 클래스 (왕패도 관리)

#### 게임 외 (Etc.js)

- `LobbyManager`: 방 관리
  - `Room`: 각각의 방


- `GameSetting`: 게임 설정

## 구현 시 참고 사항

- 비밀방 기능은 쿠키를 사용. 올바른 비밀번호 입력시 쿠키로 방 넘버 반환. 링크를 통한 접속 시에도 쿠키를 검사하여 정상적이지 않은 경우 입장 불가
- 기본적인 게임 처리는 모두 서버에서 처리. 웹 브라우저 조작을 통한 해킹 방지
- 사용 API
  - `Express`: 웹 페이지
  - `socket.io`: 네트워크
  - `Bootstrap`
  - `jQuery`
  - `iconSelecet.js`
  - `jQuery-Cookie`
- 클래스 구현 시 `module.exports` 구조로 통일

## 네트워크 통신

#### 메인

- 접속 버튼 클릭시 로비로 이동할 때 아이디를 세션에 저장
- 만약 세션 정보가 존재하면 아이디 자동 입력

#### 로비

- 세션에 저장된 아이디를 받아서 캐릭터 정보 출력
- `connect`: 방 정보 전달
- `lobbyInfo`: 주기적으로 로비의 방들 정보 전달
- `roomInfo`: 방 클릭시 방 정보 전달
- `enterRoom`: 정상적으로 접속 성공시 전달, 게임 페이지로 이동

#### 게임

- `playerEnter/Quit`: 플레이어 입퇴장
- `playState`: 게임의 진행 상황을 서버에서 전달 (플레이어 마다 다르게 전달)
- `playerAction`: 플레이어의 행동을 서버로 전달

## 개발 일지

[01.24] 기획서 작성 - 솔직히 이거 완성할 수 있을까...

[01.25] 기획서 보충, 구체적 구현 방법 구상 - 내일은 그림으로 좀 그려 볼까나

[01.26] 서버 세팅 완료 - 파판을 결제 했다. 재밌었다.

[01.27] 메인 페이지의 로그인을 세션으로 구현, 추가 정보로 캐릭터를 설정할 수 있게 하였다 - 생각보다 기능 만들기가 수월하다...? 불안한데...

[01.28] 기본 적인 로비 기능(방 목록, 입장, 퇴장, 자동 방 삭제) 구현 - 클래스들에 대한 정리가 좀 필요할 것 같다. 그리고 방의 자동 삭제 시 메모리 누수가 좀 걱정인데... 내일은 비밀번호 기능을 추가해야지.

[01.29] 방에 비밀번호 기능을 성공적으로 추가 - 근데 방에서 나와서 앞으로 가기를 누르면 방이 없을때 로비로 리다이렉트를 안한다... 1시간 넘게 고민했지만 안 풀려서 일단 나중에 해결해야지. 뭐 소켓은 잘 끊겨있겠지만...

[01.30] 마작 기본 클래스 Mahjong을 작성. 게임 초기화, 국 준비, 손패를 떼는 것까지 완성 - 동생이 맥북 에어를 샀다... 부럽다...