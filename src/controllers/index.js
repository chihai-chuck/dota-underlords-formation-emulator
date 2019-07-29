new Vue({
    el: ".dota-underlords-formation-emulator",
    data() {
        return {
            config: {

            },
            data: {
                chessboard: [],
            },
            visible: {

            }
        }
    },
    created() {
        this.data.chessboard = new Array(32).fill(0);
    },
    methods: {

    }
});
