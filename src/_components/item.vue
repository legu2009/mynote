<template lang="jade">
li.tree-item(v-if="model.type=='folder'", 
        :class="{'tree-node': isFolder , 'tree-leaf': !isFolder}",
        data-id="{{*model.id}}" ,
        draggable="{{deep!=1}}" )
    div.tree-content(data-id="{{*model.id}}", 
            :style="{'padding-left': ((deep-1) * 15) + 'px' }",
            :class="{'tree-expand': isFolder && open, 'sel': $root.selItemId == model.id, 'selMenu': ($root.$refs.folderTree.contextMenuId == model.id ), 'editModel': $root.editItemId == model.id}",
            @dragenter.stop="dragenter")
        i.tree-expand-icon.iconfont(v-if="isFolder", @click="toggle") &#xe602;
        i.tree-floder-icon.iconfont &#xe600;
        span(v-if="$root.$refs.folderTree.editItemId != model.id") {{model.name}}
        input(v-if="$root.$refs.folderTree.editItemId == model.id", v-model="$root.$refs.folderTree.editName")
    ul(v-show="open", v-if="isFolder")
        item.item(v-for="model in model.children",  :model="model", :deep="deep+1")
</template>
<script>
    export default {
        props: {
            model: {},
            deep: 0
        },
        data() {
            return {
                open: true
            }
        },
        computed: {
            isFolder() {
				var children = this.model.children;
				if (!children || children.length == 0) 
					return false;
				else {
					var flag = false;
					for (var i = 0 ,l = children.length; i < l; i++) {
						if (children[i].type == 'folder') {
							return true;
						}
					}
				}
                return false;
            }
        },
        methods: {
            toggle() {
                if (this.isFolder) {
                    this.open = !this.open
                }
            },
            dragenter() {
                if (this.isFolder) {
                    this.open = true;
                }
                //this.$root.$refs.folderTree.dragEnterItemId = this.model.id;
            }
        },
        ready() {
            /*if (this.model._open) {
                this.$parent.open = true;
                delete this.model._open;
            }*/
            //console.log(this.$parent.model.id);
            if (this.model.parent != 'root')
                this.model.parent = this.$parent.model.id;
            this.$root.treeMap[this.model.id] = this.model;
        }
    }
</script>