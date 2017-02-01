/**
 * @author RaiKuma
 * @class
 * @classdesc 마작 게임 클래스
 * @param {int} initScore 초기 점수
 */
let Mahjong = function(initScore) {
    //게임 정보
    this.info = {
        guk: 0,
        bon: 0,
        oya: 0
    }

    //패산, 왕패
    this.paiSan = [];
    this.king = [];

    //플레이어 정보
    this.players = [];   

    //액션 큐
    this.queue = []; 

    /* 점수 초기화 */
    if (!initScore) initScore = 25000;
    for (let i = 0; i < 4; i++) {
        this.players.push({ score: initScore });
    }
};

// 상수
const KINGPAINUM = 14;
const INITSONPAINUM = 13;

/**
 * 판의 초기화
 */
Mahjong.prototype.setGame = function () {
    this.paiSan = [];
    this.king = [];
    this.dora = [];

    let info = this.info;
    let paiSan = this.paiSan;
    let oya = this.info.oya;
    let king = this.king;
    let dora = this.dora;
    let players = this.players;

    /* 패산 쌓기 */
    // 각 패가 4개
    /*for (let k = 0; k < 4; k++) {
        // 만 통 삭
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 9; j++) {
                let pai = {num: i*10 + j};
                paiSan.splice(Math.random() * paiSan.length, 0, pai);
            }
        }
        // 동 남 서 북 백 발 중
        for (let i = 4, j = 1; j <= 7; j++) {
            let pai = {num: i*10 + j};
            paiSan.splice(Math.random() * paiSan.length, 0, pai);
        }
    }*/
    for (let k = 0; k < 4; k++) {
        // 만 통 삭
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 9; j++) {
                //this.paiSan.push(i * 10 + j);
                let pai = i*10 + j;
                paiSan.push(pai);
            }
        }
        // 동 남 서 북 백 발 중
        for (let i = 4, j = 1; j <= 7; j++) {
            //this.paiSan.push(i * 10 + j);
            let pai = i*10 + j;
            paiSan.push(pai);
        }
    }

    /* 왕패 떼기 */
    for (let i = 0; i < KINGPAINUM; i++) {
        tsumo(paiSan, king, false);
    }

    /* 플레이어 설정 */
    for (let i = 0; i < 4; i++) {
        let player = players[i];

        player.ga = (i - oya + 4) % 4;
        player.sonPai = [];
        player.tsumoPai = null;
        player.river = [];
        player.cry = [];
        player.state = [];

        for (let j = 0; j < INITSONPAINUM; j++) {
            tsumo(paiSan, player.sonPai, false);
        }
    }
    info.turn = oya;
    tsumo(paiSan, players[oya].sonPai, true, players[oya]);

    /* 도라 까기 */
    tsumo(king, dora, false);
}

/** 
 * 다음 판으로 진행
 * @param {Bool} yon 연장 여부
 */
Mahjong.prototype.nextGame = function (yon) {
    if (yon) {
        this.info.bon++;
    } else {
        this.info.guk++;
        this.info.oya = (this.info.oya + 1) % 4;
    }
}

/**
 * 디버그용 출력 함수
 */
Mahjong.prototype.showState = function () {
    let players = this.players;
    let info = this.info;
    let paiSan = this.paiSan;
    let king = this.king;
    let dora = this.dora;
    let queue = this.queue;

    function paiStr(arr) {
        return arr.map(function (pai) {
            return pai;
        })
    }

    function expaiStr(arr) {
        return arr.map(function (expai) {
            let ret = '' + expai.pai;
            if (expai.tsumo) ret += '*';
            if (expai.take) ret += '/';
            return ret;
        })
    }

    console.log('플레이어:');
    console.log(players.map(function (player) {
        let ret = '';
        ret += GA(player.ga) + ' : ';
        ret += '점수 < ' + player.score + ' > ';
        ret += '[ ' + paiStr(player.sonPai);
        if (player.tsumoPai != null) {
            ret += '/' + player.tsumoPai;
        }
        ret += ' ] ';
        ret += '운패 [ ' + player.cry.map(function (cry) {
            let ret = '' + paiStr(cry.pais);
            if (cry.from) ret += '-' + cry.from
            return ret;
        }) + ' ] ';
        ret += '상태 [ ' + player.state + ' ] ';
        ret += '버림패 [ ' + expaiStr(player.river) + ' ] ';
        return ret
    }));
    console.log(GA(parseInt(info.guk / 4)), info.guk % 4 + 1, '국',
        info.bon, '본장');
    console.log('오야:', info.oya, '차례:', info.turn);
    console.log('남은패:', paiSan.length+'장',
        paiStr(paiSan).join());
    console.log('왕패: [', paiStr(king).join(),']',
        '도라: [', paiStr(dora).join(),']');
    console.log('큐:', queue.map(function (action) {
        return action;
    }));
    console.log();
}

Mahjong.prototype.doAction = function (a) {
    console.log(a);

    let players = this.players;
    let info = this.info;
    let paiSan = this.paiSan;
    let queue = this.queue;

    // 액션을 실행한 플레이어 위주로 변수를 이용한다
    let player = players[a.player];
    let state = player.state;
    let sonPai = player.sonPai;
    let cry = player.cry

    // 방금 버린 패가 있는 강
    let river = players[info.turn].river;
    // 가져올 패
    let wantPai = river[river.length - 1];

    switch (a.action) {
        /**
         * 패 버리기
         * @param {Action} action giri
         * @param {int} player 버리는 플레이어 넘버
         * @param {Pai} pai 버릴패
         * @param {Bool} tsumo 쯔모패를 버리는지
         */
        case 'giri': {
            //let player = this.player[a.player];

            // 기리 가능한 상태인지
            if (!(state.includes('tsumo') ||
                state.includes('cry'))) {
                console.log('**기리 불가능 상태**');
                return false;
            }
            // 방금 운 패는 못 버림
            if (state.includes('cry') &&
                a.pai == cry[cry.length - 1].pais[2]) {
                console.log('**방금 운 패는 못 버림**');
                return false;
            }
            // 가지고 있는지
            if ((!a.tsumo) && (!sonPai.includes(a.pai))) {
                console.log('**손패에 없음**');
                return false;
            }
            if ((a.tsumo) && (player.tsumoPai != a.pai)) {
                console.log('**쯔모패 아님**');
                return false;
            }

            // 기리
            giri(player, a.pai, a.tsumo);

            // 후처리
            player.state = [];

            // 특수 행동 가능한 사람이 있는지 갱신
            let flag = false;
            for (let i = 1; i < 4; i++) {
                // 자신으로 부터 오른쪽으로 돌며 검사
                let j = (info.turn + i) % 4
                let player = players[j];

                player.state = [];

                if (i == 1 && checkChi(player.sonPai, a.pai)) {
                    player.state.push('chi');
                    flag = true;
                }

                if (checkPong(player.sonPai, a.pai)) {
                    player.state.push('pong');
                    flag = true;
                }

                if (checkKang(player.sonPai, a.pai)) {
                    player.state.push('kang');
                    flag = true;
                }

                if (checkRon(player, a.pai)) {
                    player.state.push('ron');
                    flag = true;
                }
            }
            // 없으면 다음 턴으로
            if (!flag) {
                this.nextTurn();
                tsumo(paiSan, players[info.turn].sonPai, true, players[info.turn]);
            }
            return true;
        }
        /**
         * 치
         * @param {Action} action chi
         * @param {int} player 치 하는 플레이어 넘버
         * @param {Array} hasPais 가지고 있는 패
         */
        case 'chi': {
            let hasPais = a.hasPais;

            // 유효성 체크
            if (!state.includes('chi')) {
                console.log('**치 가능한 상태 아님**');
                return false;
            }
            if (hasPais.length != 2) {
                console.log('**치는 2개의 패가 전달되야 함**');
                return false;
            }
            if (!(sonPai.includes(a.hasPais[0]) && sonPai.includes(a.hasPais[1]))) {
                console.log('**손패에 없음**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkChi(hasPais, wantPai.pai)) {
                console.log('**치 불가능**');
                return false;
            }

            player.state = [];

            // 큐에 넣는다
            a.wantPai = wantPai;
            queue.push(a);

            // 퐁 깡 론이 있으면 대기
            if (hasToWait(players, ['pong', 'kang', 'ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        /**
         * 퐁
         * @param {Action} action pong
         * @param {int} player 퐁 하는 플레이어 넘버
         */
        case 'pong': {
            // 유효성 체크
            if (!state.includes('pong')) {
                console.log('**퐁 가능한 상태 아님**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkPong(sonPai, wantPai.pai)) {
                console.log('**퐁 불가능**');
                return false;
            }

            player.state = [];

            // 큐에 넣는다
            /*let hasPais = paiFind(sonPai, wantPai, true);
            if (hasPais.length == 3) hasPais.pop();
            a.hasPais = hasPais;*/
            a.hasPais = [wantPai.pai, wantPai.pai];
            a.wantPai = wantPai;
            this.queue.push(a);

            // 론이 있으면 대기
            if (hasToWait(players, ['ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        /**
         * 깡
         * @param {Action} action kang
         * @param {int} player 깡 하는 플레이어 넘버
         * @param {Array} hasPais 가지고 있는 패
         */
        case 'kang': {
            // 유효성 체크
            if (!state.includes('kang')) {
                console.log('**깡 가능한 상태 아님**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkKang(sonPai, wantPai.pai)) {
                console.log('**깡 불가능**');
                return false;
            }

            // 사깡즈
            if (this.dora.length >= 4) {
                console.log('**사깡즈**');
                return false;
            }

            player.state = [];

            // 큐에 넣는다
            a.hasPais = [wantPai.pai, wantPai.pai, wantPai.pai];
            a.wantPai = wantPai;
            queue.push(a);

            // 론이 있으면 대기
            if (hasToWait(players, ['ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        /**
         * 안깡
         * @param {Action} action ankang
         * @param {int} player 안깡 하는 플레이어 넘버
         */
        case 'ankang': {
            // 유효성 체크
            if (!state.includes('tsumo')) {
                console.log('**안깡 가능한 상태 아님**');
                return false;
            }
            let pais = checkAnkang(sonPai)
            if (pais.length != 4) {
                console.log('**안깡 불가능**');
                return false;
            }

            // 사깡즈
            if (this.dora.length >= 4) {
                console.log('**사깡즈**');
                return false;
            }

            let tmp = {pais: pais};
            cry.push(tmp);

            // 영상패 쯔모
            tsumo(paiSan, players[kang.player].sonPai, true, players[kang.player]);
            // 도라 추가
            tsumo(this.king, this.dora, false);
        }
        case 'ron':
            return true;

        case 'tsumo':
            return true;

        case 'rich':
            return true;

        /**
         * 캔슬
         */
        case 'cancel': {
            player.state = [];
            if (hasToWait(players, ['chi', 'pong', 'kang', 'ron'])) {
                return true;
            }
            this.processQueue();
            return true;
        }
    }
}

/**
 * 큐에서 우선순위가 높은 일부터 처리한다
 */
Mahjong.prototype.processQueue = function () {
    let info = this.info
    let paiSan = this.paiSan
    let players = this.players;
    let queue = this.queue;

    players.forEach(function(player) {
        player.state = [];
    });

    /* 아무 행동도 없음 다음 차례로 */
    if (queue.length == 0) {
        this.nextTurn();
        tsumo(paiSan, players[info.turn].sonPai, true, players[info.turn]);
        return;
    }

    let kang = queue.filter(function (a) {
        if (a.action == 'kang') return true;
        return false;
    });
    let pong = queue.filter(function (a) {
        if (a.action == 'pong') return true;
        return false;
    });
    let chi = queue.filter(function (a) {
        if (a.action == 'chi') return true;
        return false;
    });

    // 이하 필요에 따라 달라지는 변수
    let sonPai;
    let wantPai;

    /* 깡 */
    if (kang.length != 0) {
        kang = kang[0];

        sonPai = players[kang.player].sonPai;
        wantPai = kang.wantPai;

        cry(players[kang.player], info.turn, kang.hasPais, wantPai);
        info.turn = kang.player;

        // 영상패 쯔모
        tsumo(paiSan, players[kang.player].sonPai, true, players[kang.player]);
        // 도라 추가
        tsumo(this.king, this.dora, false);

    /* 퐁 */
    } else if (pong.length != 0) {
        pong = pong[0];

        sonPai = players[pong.player].sonPai;
        wantPai = pong.wantPai;

        cry(players[pong.player], info.turn, pong.hasPais, wantPai);
        info.turn = pong.player;

    /* 치 */
    } else if (chi.length != 0) {
        console.log('치')
        chi = chi[0];

        sonPai = players[chi.player].sonPai;
        wantPai = chi.wantPai;

        cry(players[chi.player], info.turn, chi.hasPais, wantPai);
        info.turn = chi.player;
    }

    this.queue = [];
    return;
}

/**
 * 다음 턴으로
 */
Mahjong.prototype.nextTurn = function() {
    let info = this.info;
    let players = this.players;

    info.turn = (info.turn + 1) % 4;
    this.queue = [];
}

module.exports = Mahjong;

/**
 * 울기
 * @param {Player} player 우는 플레이어
 * @param {int} from 가져오는 패의 주인 넘버
 * @param {Array} hasPais 우는데 사용하는 패
 * @param {Pai} wantPai 가져올 패
 */
let cry = function (player, from, hasPais, wantPai) {
    let sonPai = player.sonPai;

    // 버림패에 표시
    wantPai.take = true;

    // 손패에서 제거
    hasPais.forEach(function(pai) {
        sonPai.splice(sonPai.indexOf(pai), 1);
    });

    // 운패에 추가
    let cry = {}
    cry.pais = hasPais;
    cry.pais.push(wantPai.pai);
    cry.from = ''+from;
    player.cry.push(cry);

    // 상태 갱신
    player.state.push('cry');
}

/**
 * 패 받기
 * @param {Array} from Source
 * @param {Array} to Destination
 * @param {Bool} tsumo 쯔모 패 여부
 * @param {Player} player [상태 표시 용]
 */
let tsumo = function (from, to, tsumo, player) {
    let pai = from.pop();
    //pai.tsumo = tsumo;
    if (tsumo) {
        player.tsumoPai = pai;
        player.state.push('tsumo');
    } else {
        to.push(pai);
    }
}

/**
 * 패 버리기
 * @param {Player} player 버리는 플레이어
 * @param {Pai} pai 버리는 패
 * @param {Bool} tsumo 쯔모패인지 여부
 */
let giri = function (player, pai, tsumo) {
    let expai = {
        pai: pai,
    }

    if (tsumo) {
        expai.tsumo = true;
    } else {
        let sonPai = player.sonPai;
        sonPai.splice(sonPai.indexOf(pai), 1);
        if (player.tsumoPai != null) {
            sonPai.push(player.tsumoPai);
        }
    }

    player.tsumoPai = null;
    player.river.push(expai);
}

/**
 * 치 가능 여부
 * @param {Array} sonPai 손패
 * @param {Pai} pai 가져올 패
 */
let checkChi = function (sonPai, pai) {
    // 자패면 패스
    if (parseInt(pai / 10) == 4) {
        return false;
    }

    // 1번 케이스
    if (sonPai.includes(pai - 2) && sonPai.includes(pai - 1)) {
        return true;
    }
    // 2번 케이스
    if (sonPai.includes(pai - 1) && sonPai.includes(pai + 1)) {
        return true;
    }
    // 3번 케이스
    if (sonPai.includes(pai + 1) && sonPai.includes(pai + 2)) {
        return true;
    }

    return false;
}

/**
 * 퐁 가능 여부
 * @param {Array} sonPai 손패
 * @param {Pai} pai 가져올 패
 */
let checkPong = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 2개 이상
    if (count >= 2) return true;

    return false;
}

/**
 * 깡 가능 여부
 * @param {Array} sonPai 손패
 * @param {Pai} pai 가져올 패
 */
let checkKang = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 3개 이상
    if (count >= 3) return true;

    return false;
}

let checkAnkang = function(sonPai) {
    return [];
}

let checkRon = function (player, pai) {
    return false;
}

/**
 * 다른 플레이어가 해당하는 상태를 가지고 있는지 판단
 * @param {Array} players 플레이어 배열
 * @param {Array} states 기다릴 상태
 */
let hasToWait = function (players, states) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < states.length; j++) {
            if (players[i].state.includes(states[j])) {
                return true;
            }
        }
    }
    return false;
}

function GA(ga) {
    switch (ga) {
        case 'DONG': return 0;
        case 'NAM': return 1;
        case 'SEO': return 2;
        case 'BUK': return 3;
        case 0: return '동';
        case 1: return '남';
        case 2: return '서';
        case 3: return '북';
        default: return undefined;
    }
}

function PAI(pai) {
    /* 11 -> 1통 */
    if (typeof pai == 'number') {
        switch (parseInt(pai / 10)) {
            case 1: return '' + (pai % 4) + '만';
            case 2: return '' + (pai % 4) + '통';
            case 3: return '' + (pai % 4) + '삭';
            case 4:
                switch (pai % 10) {
                    case 1: return '동';
                    case 2: return '남';
                    case 3: return '서';
                    case 4: return '북';
                    case 5: return '백';
                    case 6: return '발';
                    case 7: return '중';
                }
        }

        /* 1통 -> 11 */
    } else {
    }
}