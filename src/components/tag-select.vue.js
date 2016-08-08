'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// <template lang="jade">
// div.tag-box2
//     a.btn.btn-sm.tagButton(v-for="model in tagSels") {{model}}&nbsp;&nbsp;
//         span.fa.fa-times(@click="tagSels.$remove(model)")
//     div.input-box
//         input(placeholder="请输入标签", @keydown="filterKeyDown", @focus="isShowSuggest=true", v-model="ipt")
//         ul.input-suggest.scrollbar(v-show="isShowSuggest&&suggestList.length>0") 
//             li(v-for="model in suggestList",
//                 :class="{'input-sugges-highlighted': $index == highlightIndex}",
//                 @click="selectItem($index)") {{model}}
// </template>
// <script>
var KEY = {
    UP: 38,
    DOWN: 40,
    DEL: 46,
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    COMMA: 188,
    PAGEUP: 33,
    PAGEDOWN: 34,
    BACKSPACE: 8
};
var undefined;
exports.default = {
    props: {
        tagList: [],
        tagSels: []
    },
    data: function data() {
        return {
            isShowSuggest: false,
            suggestList: [],
            ipt: '',
            highlightIndex: -1,
            hasScroll: undefined
        };
    },

    watch: {
        ipt: function ipt(val) {
            var _this = this;

            var res = [];
            var tagSels = this.tagSels;
            MAIN_PAGE.tagList.forEach(function (tmp) {
                if (tmp.indexOf(val) != -1) {
                    if (tagSels.indexOf(tmp) == -1) res.push(tmp);
                }
            });
            this.isShowSuggest = true;
            this.suggestList = res;
            this.hasScroll = undefined;
            this.highlightIndex = -1;
            this.$nextTick(function () {
                _this.getHasScroll();
            });
        }
    },
    methods: {
        selectItem: function selectItem(index) {
            this.append(this.suggestList[index]);
            this.highlightIndex = -1;
            this.ipt = '';
            this.isShowSuggest = false;
        },
        getHasScroll: function getHasScroll() {
            if (this.hasScroll === undefined && this.suggestList.length > 0) {
                var listHeight = this.$el.querySelector('.input-suggest').offsetHeight;
                var h = 0;
                _.each(this.$el.querySelectorAll('.input-suggest li'), function (el) {
                    h += el.offsetHeight;
                });
                this.hasScroll = listHeight < h;
            }
        },
        filterKeyDown: function filterKeyDown(event) {
            var keyCode = event.keyCode || event.which || event.charCode;
            var highlightIndex = this.highlightIndex;
            var length = this.suggestList.length;
            switch (keyCode) {
                case KEY.UP:
                    highlightIndex = highlightIndex - 2;
                case KEY.DOWN:
                    highlightIndex++;
                    this.highlightIndex = (highlightIndex + length) % length;
                    if (this.hasScroll) {
                        var list = this.$el.querySelector('.input-suggest');
                        list.scrollTop = list.querySelectorAll('li')[this.highlightIndex].offsetTop;
                    }
                    this.isShowSuggest = true;
                    break;
                case KEY.RETURN:
                    var res = false;
                    if (this.highlightIndex != -1) {
                        res = this.append(this.suggestList[this.highlightIndex]);
                    } else if (this.ipt) {
                        res = this.append(this.ipt);
                    }
                    if (res) {
                        this.ipt = '';
                        this.highlightIndex = -1;
                        this.isShowSuggest = false;
                    }
                    break;
                case KEY.ESC:
                    this.highlightIndex = -1;
                    this.isShowSuggest = false;
                    break;
                case KEY.DEL:
                case KEY.BACKSPACE:
                    if (this.ipt == '' && this.tagSels.length > 0) {
                        this.tagSels.splice(this.tagSels.length - 1, 1);
                    }
            }
        },
        append: function append(text) {
            if (this.tagSels.length > 6) return false;
            if (this.tagSels.indexOf(text) == -1) {
                this.tagSels.push(text);
                return true;
            }
            return false;
        }
    },
    ready: function ready() {
        var _this2 = this;

        $doc.on('click', function (e) {
            if ($(_this2.$el).find(e.target).length == 0) {
                _this2.isShowSuggest = false;
            }
        });
    }
}
// </script>
;
exports.default.template = '<div class="tag-box2"><a v-for="model in tagSels" class="btn btn-sm tagButton">{{model}}&nbsp;&nbsp;<span @click="tagSels.$remove(model)" class="fa fa-times"></span></a><div class="input-box"><input placeholder="请输入标签" @keydown="filterKeyDown" @focus="isShowSuggest=true" v-model="ipt"/><ul v-show="isShowSuggest&amp;&amp;suggestList.length&gt;0" class="input-suggest scrollbar"> <li v-for="model in suggestList" :class="{\'input-sugges-highlighted\': $index == highlightIndex}" @click="selectItem($index)">{{model}}</li></ul></div></div>';