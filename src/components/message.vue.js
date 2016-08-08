'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// <template lang="jade">
// div.global-message-list.transition.hide(v-show="mess", style="top: 0px;")
//     ul.message-list
//         li.message-list-entry.message-list-entry-with-action
//             div.actions-container
//                 div.message-action(v-for="m in btns")
//                     a.action-button(@click="action(m.action)") {{m.name}}
//             div.message-left-side.message-overflow-ellipsis
//                 span.message-left-side.severity(:class="'app-' + type") {{type}}
//                 span.message-left-side {{mess}}
// </template>
// <script>
exports.default = {
    data: function data() {
        return {
            btns: [],
            mess: '',
            type: 'info',
            fns: {}
        };
    },

    methods: {
        action: function action(s) {
            if (typeof s == 'function') {
                s.call(this);
            } else if (this[s]) {
                this[s]();
            }
        },
        alert: function alert(mess, time) {
            var _this = this;

            this.mess = mess;
            this.btns = [];
            time = time || 2000;
            if (time > 0) {
                setTimeout(function () {
                    _this.mess = "";
                }, time);
            }
        },
        close: function close() {
            this.mess = "";
        },
        open: function open(btns, mess, type, fn) {
            this.btns = btns;
            this.mess = mess;
            this.type = type;
            this.fns = fn;
        }
    },
    ready: function ready() {
        this.$el.classList.remove('hide');
    }
}
// </script>
;
exports.default.template = '<div v-show="mess" style="top: 0px;" class="global-message-list transition hide"><ul class="message-list"><li class="message-list-entry message-list-entry-with-action"><div class="actions-container"><div v-for="m in btns" class="message-action"><a @click="action(m.action)" class="action-button">{{m.name}}</a></div></div><div class="message-left-side message-overflow-ellipsis"><span :class="\'app-\' + type" class="message-left-side severity">{{type}}</span><span class="message-left-side">{{mess}}</span></div></li></ul></div>';