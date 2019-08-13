new Vue({
    el: ".dota-underlords-formation-emulator",
    data() {
        return {
            config: {
                apiUrlPrefix: "//localhost:55105/api/wiki/get_excel_data_for_dev/?wiki_id=1000000011&file_id=",
                imageUrlPrefix: "//cdn.max-c.com/wiki/1000000011/",
                imageUrlSuffix: "?v=9999",
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
                heroes: {},
                items: {}
            },
            visible: {

            }
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
                    params["api_alliances1"] = params["api_alliances1"].split(",");
                    params["api_alliances2"] = params["api_alliances2"].split(",");
                    params["id_img"] = this.config.imageUrlPrefix + params["id_img"] + this.config.imageUrlSuffix;
                    params["skill_img"] = this.config.imageUrlPrefix + params["skill_img"] + this.config.imageUrlSuffix;
                    temp[params.api_id] = params;
                });
                console.log(temp)
                this.data.heroes = temp;
            });
        },
        getItemsData() {

        }
    }
});
