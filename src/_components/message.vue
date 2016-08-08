<template lang="jade">
div.global-message-list.transition.hide(v-show="mess", style="top: 0px;")
    ul.message-list
        li.message-list-entry.message-list-entry-with-action
            div.actions-container
                div.message-action(v-for="m in btns")
                    a.action-button(@click="action(m.action)") {{m.name}}
            div.message-left-side.message-overflow-ellipsis
                span.message-left-side.severity(:class="'app-' + type") {{type}}
                span.message-left-side {{mess}}
</template>
<script>
    export default {
        data() {
            return {
                btns: [],
                mess: '',
                type: 'info',
                fns: {}
            }
        },
        methods: {
            action(s) {
                if (typeof s == 'function') {
                    s.call(this);
                } else if (this[s]){
                    this[s]();
                }
            },
            alert(mess, time) {
                this.mess = mess;
                this.btns = [];
                time = time || 2000;
                if (time > 0) {
                    setTimeout(() => {
                        this.mess = "";
                    }, time)
                }
            },
            close() {
                this.mess = "";
            },
            open(btns, mess, type, fn) {
                this.btns = btns;
                this.mess = mess;
                this.type = type;
                this.fns = fn;
            }
        },
        ready() {
            this.$el.classList.remove('hide')
        }
    }
</script>