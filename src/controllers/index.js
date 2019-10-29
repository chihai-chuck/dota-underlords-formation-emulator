window.dotaUnderlordsFormationEmulator = new Vue({
    el: ".dota-underlords-formation-emulator",
    data() {
        return {
            config: {
                apiHeroesId: "310739", // API获取英雄数据的fileId
                apiAlliancesId: "311021", // API获取联盟数据的fileId
                apiItemsId: "308917", // API获取物品数据的fileId
                apiUrlPrefix: location.origin + "/wiki/get_excel_data_for_dev/?wiki_id=1000000011&file_id=", // API获取数据的请求地址
                imageUrlPrefix: "//cdn.max-c.com/wiki/1000000011/", // 图片链接前缀
                imageUrlSuffix: "?v=9999", // 图片链接后缀
                heroesItemSelectTimer: -1, // 用于判断在棋盘格子中英雄点击或长按的计时器
                alliancesColor: { // 联盟图标配色
                    "blood_bound": "#567919", // 血亲
                    "primordial": "#00adcd", // 太古
                    "elusive": "#4877aa", // 无踪
                    "druid": "#308a39", // 德鲁伊
                    "demon_hunter": "#943287", // 恶魔猎人
                    "demon": "#6e0a04", // 恶魔
                    "heartless": "#32a948", // 无情
                    "dragon": "#c93900", // 龙族
                    "scrappy": "#859c07", // 好斗
                    "shaman": "#1f7346", // 萨满
                    "deadeye": "#c79400", // 神枪手
                    "brawny": "#881713", // 悍将
                    "warrior": "#35649e", // 勇士
                    "warlock": "#97448e", // 术士
                    "assassin": "#791da5", //刺客
                    "troll": "#68442a", // 巨魔
                    "savage": "#8d2b0a", // 野人
                    "knight": "#e1cb1a", // 骑士
                    "inventor": "#ad5e01", // 发明家
                    "scaled": "#4e45cc", // 鳞甲
                    "human": "#00bd9e", // 人族
                    "mage": "#35a0aa", // 法师
                    "hunter": "#ce5b39", // 猎人
                    "healer": "#45af53", // 医者
                    "champion": "#8167a8", // 统御者
                    "insect": "#4355d1", // 虫族
                    "brute": "#43362d" // 蛮族
                }
            },
            data: {
                chessboard: [],
                chessboardSelectIndex: -1,
                chessboardChangeIndex: -1,
                chessboardActiveIndex: -1,
                chessboardActiveItems: "",
                heroes: {},
                heroesPriceGroup: {
                    "1": [],
                    "2": [],
                    "3": [],
                    "4": [],
                    "5": []
                },
                items: {},
                itemsLevelGroup: {
                    "1": [],
                    "2": [],
                    "3": [],
                    "4": [],
                    "5": []
                },
                chessboardHeroesAlliances: [],
                alliances: {}
            },
            visible: {
                heroesList: false,
                itemsList: false
            }
        }
    },
    computed: {
        chessboardValuable() {
            return this.data.chessboard.filter(Boolean);
        },
        heroesHaveItemList() {
            return this.data.chessboard.filter(i => i && i.items);
        },
        chessboardHeroesAlliancesCount() {
            const temp = {};
            for(let alliances of this.data.chessboardHeroesAlliances) {
                temp[alliances[0]] = [...new Set(alliances[1])].length;
            }
            return temp;
        }
    },
    watch: {
        "data.chessboardActiveIndex"(index) {
            this.data.chessboardActiveItems = this.data.chessboard[index] ? this.data.chessboard[index].items || "" : "";
        },
        "data.chessboard"(chessboard) {
            const temp = {};
            for(let data of chessboard.filter(Boolean)) {
                for(let alliances of this.data.heroes[data.heroes].api_alliances) {
                    if(temp[alliances]) {
                        temp[alliances].push(data.heroes);
                    } else {
                        temp[alliances] = [data.heroes];
                    }
                }
            }
            this.$set(this.data, "chessboardHeroesAlliances", Object.entries(temp));
        }
    },
    created() {
        this.setChessboard();
        Promise.all([
            this.getHeroesData(),
            this.getAlliancesData(),
            this.getItemsData()
        ]).then(() => {
            const formationData = new URLSearchParams(location.search).get("duFormation");
            if(formationData) {
                this.restoreFormationURL(formationData);
            }
        });
    },
    methods: {
        setChessboard() {
            this.data.chessboard = new Array(32).fill();
        },
        getHeroesData() {
            return new Promise(resolve => {
                fetch(this.config.apiUrlPrefix + this.config.apiHeroesId).then(res => res.json()).then(res => {
                    const data = res.result.table;
                    const keys = data[0];
                    const list = data.slice(3);
                    const temp = {};
                    for(let heroes of list) {
                        const params = {};
                        heroes.forEach((item, index) => {
                            params[keys[index]] = item;
                        });
                        params.api_alliances1 = params.api_alliances1.split(",");
                        params.api_alliances2 = params.api_alliances2.split(",");
                        params.api_alliances = [...params.api_alliances1, ...params.api_alliances2];
                        params.id_img = this.config.imageUrlPrefix + params.id_img + this.config.imageUrlSuffix;
                        params.skill_img = this.config.imageUrlPrefix + params.skill_img + this.config.imageUrlSuffix;
                        temp[params.api_id] = params;
                        this.data.heroesPriceGroup[params.Grade1_buy].push(params);
                        this.imgPreLoad(params.id_img);
                        // this.imgPreLoad(params.skill_img);
                    }
                    this.data.heroes = temp;
                    resolve();
                });
            });
        },
        getAlliancesData() {
            return new Promise(resolve => {
                fetch(this.config.apiUrlPrefix + this.config.apiAlliancesId).then(res => res.json()).then(res => {
                    const data = res.result.table;
                    const keys = data[0];
                    const list = data.slice(3);
                    const temp = {};
                    for(let alliances of list) {
                        const params = {};
                        alliances.forEach((item, index) => {
                            params[keys[index]] = item;
                        });
                        params.api_des = JSON.parse(params.api_des);
                        params.api_maxHeroesCount = +params.api_maxHeroesCount;
                        params.api_minHeroesCount = +params.api_minHeroesCount;
                        temp[params.api_id] = params;
                    }
                    this.data.alliances = temp;
                    resolve();
                });
            });
        },
        getItemsData() {
            return new Promise(resolve => {
                fetch(this.config.apiUrlPrefix + this.config.apiItemsId).then(res => res.json()).then(res => {
                    const data = res.result.table;
                    const keys = data[0];
                    const list = data.slice(3);
                    const temp = {};
                    for(let items of list) {
                        const params = {};
                        items.forEach((item, index) => {
                            params[keys[index]] = item;
                        });
                        params.id_img = this.config.imageUrlPrefix + params.id_img + this.config.imageUrlSuffix;
                        temp[params.api_id] = params;
                        if(params.tier) {
                            params.tier = +params.tier;
                            this.data.itemsLevelGroup[params.tier].push(params);
                        }
                        this.imgPreLoad(params.id_img);
                    }
                    this.data.items = temp;
                    resolve();
                });
            });
        },
        heroesListClose(event) {
            if(event.target === this.$refs.heroesListPopup || event.target === this.$refs.heroesListPopupContent) {
                this.visible.heroesList = false;
            }
        },
        itemsListClose(event) {
            if(event.target === this.$refs.itemsListPopup || event.target === this.$refs.itemsListPopupContent) {
                this.visible.itemsList = false;
            }
        },
        selectHeroes(index) {
            let heroesData = this.data.chessboard[index];
            if(this.data.chessboardChangeIndex > -1) {
                this.$set(this.data.chessboard, index, this.data.chessboard[this.data.chessboardChangeIndex]);
                this.$set(this.data.chessboard, this.data.chessboardChangeIndex, heroesData);
                if(this.data.chessboardActiveIndex > -1) {
                    this.data.chessboardActiveIndex = index;
                    this.data.chessboardActiveItems = this.data.chessboard[index] ? this.data.chessboard[index].items || "" : "";
                }
                this.data.chessboardChangeIndex = -1;
            } else {
                if(heroesData) {
                    this.data.chessboardChangeIndex = index;
                } else {
                    if(this.chessboardValuable.length >= 10) {
                        this.alert("最多添加10个棋子");
                    } else {
                        this.data.chessboardSelectIndex = index;
                        this.visible.heroesList = true;
                    }
                }
            }
        },
        setHeroes(heroes) {
            this.$set(this.data.chessboard, this.data.chessboardSelectIndex, {
                index: this.data.chessboardSelectIndex,
                heroes: heroes.api_id,
                avatar: heroes.id_img,
                items: void 0
            });
            this.visible.heroesList = false;
        },
        setItems(items) {
            this.data.chessboardActiveItems = items.api_id;
            this.visible.itemsList = false;
        },
        heroesItemSelectStart(index) {
            clearTimeout(this.config.heroesItemSelectTimer);
            this.config.heroesItemSelectTimer = -1;
            this.config.heroesItemSelectTimer = setTimeout(() => {
                this.config.heroesItemSelectTimer = -1;
                if(this.data.chessboard[index]) {
                    this.data.chessboardActiveIndex = index;
                }
            }, 600);
        },
        heroesItemSelectMove() {
            clearTimeout(this.config.heroesItemSelectTimer);
            this.config.heroesItemSelectTimer = -1;
        },
        heroesItemSelectEnd(index) {
            clearTimeout(this.config.heroesItemSelectTimer);
            if(this.config.heroesItemSelectTimer > -1) {
                this.selectHeroes(index);
            }
        },
        heroesRemove() {
            this.$set(this.data.chessboard, this.data.chessboardActiveIndex, void 0);
            this.data.chessboardActiveIndex = -1;
        },
        heroesItemsAdd() {
            this.$set(this.data.chessboard, this.data.chessboardActiveIndex, Object.assign(this.data.chessboard[this.data.chessboardActiveIndex], {
                items: this.data.chessboardActiveItems
            }));
            this.data.chessboardActiveIndex = -1;
        },
        chessboardClear() {
            this.data.chessboardActiveIndex = -1;
            this.setChessboard();
        },
        alert(msg, title = "提示", protocolType = "alert", alertType = "default", state = "ok") {
            window.location.href = "heybox://" + encodeURIComponent(JSON.stringify({
                "protocol_type": protocolType,
                "title": title,
                "desc": msg,
                "alert_type": alertType,
                "state": state
            }));
        },
        imgPreLoad(url) {
            document.createElement("img").src = url;
        },
        chessboardHeroesAlliancesSort(alliances) {
            return JSON.parse(JSON.stringify(alliances)).sort(a => {
                const count = this.chessboardHeroesAlliancesCount[a[0]];
                const minCount = this.data.alliances[a[0]].api_minHeroesCount;
                if(count > minCount) {
                    return 1;
                } else if(count < minCount) {
                    return -1;
                }
                return 0;
            }).reverse();
        },
        chessboardHeroesAlliancesDesc(alliances) {
            const desc = this.data.alliances[alliances].api_des;
            const levels = Object.keys(desc).map(Number);
            const index = levels.findIndex(n => this.chessboardHeroesAlliancesCount[alliances] < n);
            return desc[levels[index > 0 ? index - 1 : 0]];
        },
        copyText(str) {
            const el = document.createElement("input");
            el.value = str;
            el.style.position = "fixed";
            el.style.top = "-9999px";
            el.style.left = "-9999px";
            document.body.appendChild(el);
            el.select();
            el.setSelectionRange(0, el.value.length);
            document.execCommand("copy");
            document.body.removeChild(el);
        },
        createFormationURL() {
            const temp = [];
            for(let data of this.chessboardValuable) {
                const chessman = {
                    h: data.heroes,
                    i: data.index
                };
                if(data.items) chessman.s = data.items;
                temp.push(chessman);
            }
            const url = new URL(location.href);
            const newUrl = new URL(url.origin + url.pathname);
            newUrl.searchParams.set("article_id", url.searchParams.get("article_id"));
            newUrl.searchParams.set("wiki_id", url.searchParams.get("wiki_id"));
            newUrl.searchParams.set("duFormation", window.btoa(JSON.stringify(temp)));
            this.copyText(newUrl.href);
            this.alert("保存的阵容链接已复制到剪贴板");
        },
        restoreFormationURL(data) {
            const code = decodeURIComponent(data);
            let jsonStr = "";
            // 之前BUG导致分享链接被url编码两次，解码时无法正常atob，此处代码为兼容解析之前BUG的分享链接
            try {
                jsonStr = window.atob(code);
            } catch {
                jsonStr = window.atob(decodeURIComponent(code));
            }
            for(let item of JSON.parse(jsonStr)) {
                this.$set(this.data.chessboard, item.i, {
                    index: item.i,
                    heroes: item.h,
                    avatar: this.data.heroes[item.h].id_img,
                    items: item.s
                });
            }
        }
    }
});
