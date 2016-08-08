<template lang="jade">
div.tree-box#ideTagTree
    ul.tag-root
        li.tag-item(v-for="model in tagGroup")
            div.tag-item-name
                i.fa.fa-tags {{model.key}}
            div.tag-item-group
                a.btn.btn-sm.tagButton(v-for="item in model.items") {{item}}&nbsp;&nbsp;
                    span.fa.fa-times
        li.tag-item
            div.tag-item-name
                i.fa.fa-tags
                input
</template>
<script>
    export default {
        props: ['tagGroup'],
        data() {
            return {
                deep: 1,
                contextMenuId: -1, //右键弹出框id
                editItemId: -1, //当前编辑的id
                editName: ''
            }
        }
    }
</script>