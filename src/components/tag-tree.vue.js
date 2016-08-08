'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// <template lang="jade">
// div.tree-box#ideTagTree
//     ul.tag-root
//         li.tag-item(v-for="model in tagGroup")
//             div.tag-item-name
//                 i.fa.fa-tags {{model.key}}
//             div.tag-item-group
//                 a.btn.btn-sm.tagButton(v-for="item in model.items") {{item}}&nbsp;&nbsp;
//                     span.fa.fa-times
//         li.tag-item
//             div.tag-item-name
//                 i.fa.fa-tags
//                 input
// </template>
// <script>
exports.default = {
    props: ['tagGroup'],
    data: function data() {
        return {
            deep: 1,
            contextMenuId: -1, //右键弹出框id
            editItemId: -1, //当前编辑的id
            editName: ''
        };
    }
}
// </script>
;
exports.default.template = '<div id="ideTagTree" class="tree-box"><ul class="tag-root"><li v-for="model in tagGroup" class="tag-item"><div class="tag-item-name"><i class="fa fa-tags">{{model.key}}</i></div><div class="tag-item-group"><a v-for="item in model.items" class="btn btn-sm tagButton">{{item}}&nbsp;&nbsp;<span class="fa fa-times"></span></a></div></li><li class="tag-item"><div class="tag-item-name"><i class="fa fa-tags"></i><input/></div></li></ul></div>';