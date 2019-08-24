window.a = new Vue({
    el: ".dota-underlords-formation-emulator",
    data() {
        return {
            config: {
                apiUrlPrefix: location.origin + "/api/wiki/get_excel_data_for_dev/?wiki_id=1000000011&file_id=",
                imageUrlPrefix: "//cdn.max-c.com/wiki/1000000011/",
                imageUrlSuffix: "?v=9999",
                heroesItemSelectTimer: -1,
                alliancesColor: {
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
                    "hunter": "#ce5b39" // 猎人
                }
            },
            data: {
                chessboard: [],
                chessboardSelectIndex: -1,
                chessboardChangeIndex: -1,
                chessboardActiveHeroes: "",
                chessboardActiveItems: "",
                heroes: {},
                heroesItem: {},
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
                }
            },
            visible: {
                heroesList: false,
                itemsList: false
            }
        }
    },
    computed: {
        chessboardCount() {
            return this.data.chessboard.filter(i => i).length;
        },
        heroesHaveItemLength() {
            return Object.keys(this.data.heroesItem).length;
        }
    },
    watch: {
        "data.chessboardActiveHeroes"(heroes) {
            this.data.chessboardActiveItems = this.data.heroesItem[heroes] || "";
        }
    },
    created() {
        this.setChessboard();
        this.getHeroesData();
        this.getItemsData();
    },
    methods: {
        setChessboard() {
            this.data.chessboard = new Array(32).fill(0);
        },
        getHeroesData() {
            fetch(this.config.apiUrlPrefix + "310739").then(res => res.json()).then(res => {
                const data = res.result.table;
                const keys = data[0];
                const list = data.slice(3);
                const temp = {};
                list.forEach(heroes => {
                    const params = {};
                    heroes.forEach((item, index) => {
                        params[keys[index]] = item;
                    });
                    params.api_alliances1 = params.api_alliances1.split(",");
                    params.api_alliances2 = params.api_alliances2.split(",");
                    params.api_alliances = params.api_alliances1.push(...params.api_alliances2);
                    params.id_img = this.config.imageUrlPrefix + params.id_img + this.config.imageUrlSuffix;
                    params.skill_img = this.config.imageUrlPrefix + params.skill_img + this.config.imageUrlSuffix;
                    temp[params.api_id] = params;
                    this.data.heroesPriceGroup[params.Grade1_buy].push(params);
                    this.imgPreLoad(params.id_img);
                    // this.imgPreLoad(params.skill_img);
                });
                console.log(temp)
                console.log(this.data.heroesPriceGroup)
                this.data.heroes = temp;
            });
        },
        getItemsData() {
            fetch(this.config.apiUrlPrefix + "308917").then(res => res.json()).then(res => {
                const data = res.result.table;
                const keys = data[0];
                const list = data.slice(3);
                const temp = {};
                list.forEach(items => {
                    const params = {};
                    items.forEach((item, index) => {
                        params[keys[index]] = item;
                    });
                    params.id_img = this.config.imageUrlPrefix + params.id_img + this.config.imageUrlSuffix;
                    temp[params.id] = params;
                    if(params.tier) {
                        this.data.itemsLevelGroup[params.tier].push(params);
                    }
                    this.imgPreLoad(params.id_img);
                });
                console.log(temp)
                console.log(this.data.itemsLevelGroup)
                this.data.items = temp;
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
            const heroes = this.data.chessboard[index];
            if(heroes) {
                if(this.data.chessboardChangeIndex > -1) {
                    this.data.chessboard[index] = this.data.chessboard[this.data.chessboardChangeIndex];
                    this.data.chessboard[this.data.chessboardChangeIndex] = heroes;
                    this.data.chessboardChangeIndex = -1;
                } else {
                    this.data.chessboardChangeIndex = index;
                }
            } else {
                this.data.chessboardChangeIndex = -1;
                if(this.chessboardCount >= 10) {
                    this.alert("最多添加10个棋子");
                } else {
                    this.data.chessboardSelectIndex = index;
                    this.visible.heroesList = true;
                }
            }
        },
        setHeroes(heroes) {
            this.data.chessboard[this.data.chessboardSelectIndex] = heroes.api_id;
            this.visible.heroesList = false;
        },
        setItems(items) {
            this.data.chessboardActiveItems = items.id;
            this.visible.itemsList = false;
        },
        heroesItemSelectStart(index) {
            clearTimeout(this.config.heroesItemSelectTimer);
            this.config.heroesItemSelectTimer = -1;
            this.config.heroesItemSelectTimer = setTimeout(() => {
                this.config.heroesItemSelectTimer = -1;
                this.data.chessboardActiveHeroes = this.data.chessboard[index];
            },600);
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
            this.data.chessboard[this.data.chessboard.indexOf(this.data.chessboardActiveHeroes)] = 0;
            this.$delete(this.data.heroesItem, this.data.chessboardActiveHeroes);
            this.data.chessboardActiveHeroes = "";
        },
        heroesItemsAdd() {
            this.$set(this.data.heroesItem, this.data.chessboardActiveHeroes, this.data.chessboardActiveItems);
            this.$forceUpdate();
        },
        chessboardClear() {
            this.data.chessboardActiveHeroes = "";
            this.data.heroesItem = {};
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
            const $img = document.createElement("img");
            $img.src = url;
        }
    }
});
