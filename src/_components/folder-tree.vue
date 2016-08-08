<template lang="jade">
div.tree-box#ideFolderTree
    ul.tree-root(@keyup.enter="editItem(editItemId)")
        item.item(:model="treeData",:deep="deep")
</template>
<script>
    export default {
        props: ['treeData', 'treeMap'],
        data() {
            return {
                deep: 1,
                contextMenuId: -1, //右键弹出框id
                editItemId: -1, //当前编辑的id
                editName: ''
            }
        },
        methods: {
            openContextMenu(id) {
                this.contextMenuId = id;
                this.menu.items[4].visible = this.treeMap[id].parent != 'root'
                setTimeout(() => {
                    this.menu.popup(remote.getCurrentWindow());
                }, 100);
            },
            editItem(id) {
                var model = this.treeMap[id];
                var val = $.trim(this.editName);
                if (val == '') {
                    if (model.name == '__新建__') { //新增删除
                        this.removeItem(id);
                    }
                } else {
                    model.name = val;
                }
                MAIN_PAGE.save();
                this.editItemId = -1;
            },
            removeItem(id) {
                var model = this.treeMap[id];
                this.treeMap[model.parent].children.$remove(model);
                this._del(model);
            },
            _del(model) {
                var tab = model.children;
                if (!tab) return;
                delete this.treeMap[model.id];
                for (var i = 0, len = tab.length; i < len; i++) {
                    this._del(tab[i]);
                }
            }
        },
        ready: function() {
            var self = this;
            var $elm = $(self.$el);
            this.$errorBox = $('<div class="tree-error-info"></div>').appendTo('body');
            $doc.on('click', (e) => {//点击外面，则隐藏
                if ($elm.find(e.target).length == 0) {
                    this.contextMenuId = this.editItemId = -1;
                } else {
                    //arrayObj.splice(start, deleteCount, [item1[, item2[, . . . [,itemN]]]])
                    /*
                    var id = $(e.target).parents('.tree-item:eq(0)').data('id');
                    console.log(self.contextMenuId ,self.selItemId , self.editItemId, id);
                    if (id != self.editItemId) {
                        self.editItemId = -1;
                    }*/
                }
            });
            var dragElm, dragId;
            $elm.on('click', '.tree-content', function() {
                if (self.editItemId != -1) { //编辑中
                    return;
                }
                MAIN_PAGE.selItemId = this.dataset.id;
                self.contextMenuId = -1;
            }).on('contextmenu', '.tree-content', function() {
                self.openContextMenu(this.dataset.id);
                return false;
            }).on('blur', 'input', function() {
                self.editItem(this.parentNode.dataset.id);
            }).on('dragstart', '.tree-item', function(e) {
                if ($elm.hasClass('tree-editing')) {
                    return false;
                }
                e.stopPropagation();
                MAIN_PAGE.selItemId = dragId = this.dataset.id;
            }).on('dragover', '.tree-content', function(e) {
                if (MAIN_PAGE.isChild(dragId, this.dataset.id, true)) {
                    e.stopPropagation();
                    return;
                }
                if (dragElm && dragElm != this) {
                    var classList = dragElm.classList;
                    classList.remove('tree-drag-before');
                    classList.remove('tree-drag-in');
                }
                dragElm = this;
                var classList = this.classList;
                classList.remove('tree-drag-before');
                classList.remove('tree-drag-in');
                if (e.offsetY <= 3) {
                    classList.add('tree-drag-before');
                } else if (e.offsetY >= 25) {
                    //e.currentTarget.classList.add('tree-drag-after');
                } else {
                    classList.add('tree-drag-in');
                }
                return false;
            }).on('drop', '.tree-content', function(e) {
                if (MAIN_PAGE.isChild(dragId, this.dataset.id, true)) {
                    return false;
                }
                var classList = this.classList;
                if (classList.contains('tree-drag-in')) {
                    var model = self.treeMap[dragId];
                    self.treeMap[model.parent].children.$remove(model);

                    var item = self.treeMap[this.dataset.id];
                    if (!item.children) {
                        Vue.set(item, 'children', []);
                    }
                    item.children.push(model);
                    model.parent = this.dataset.id;
                    MAIN_PAGE.save(); //可能会没有parent;
                } else if (classList.contains('tree-drag-before')) {
                    var model = self.treeMap[dragId];
                    self.treeMap[model.parent].children.$remove(model);
                    var item = self.treeMap[this.dataset.id];
                    var index = self.treeMap[item.parent].children.findIndex((n) => n.id == item.id);
                    self.treeMap[item.parent].children.splice(index, 0, model);

                    model.parent = item.parent;
                    MAIN_PAGE.save();
                }
                classList.remove('tree-drag-before');
                classList.remove('tree-drag-in');
                dragId = dragElm = null;
            });
            
            this.menu = Menu.buildFromTemplate([{
                label: '新增笔记',
                click: function() {
                    MAIN_PAGE.showBox = 'code';
                    MAIN_PAGE.clearBox();
                }
            },{
                label: '新增收藏',
                click: function() {
                    MAIN_PAGE.showBox = 'favorite';
                    MAIN_PAGE.clearBox();
                }
            },{
                label: '新增文件夹',
                click: function() {
                    var id = self.addModelId = self.contextMenuId;
                    if (!self.treeMap[id].children) {
                        Vue.set(self.treeMap[id], 'children', []);
                    }
                    var newId = _.insert(self.treeMap[id].children, {
                        name: '__新建__',
                        type: 'folder'
                    }).id;
                    self.editItemId = newId;
                    self.editName = "";
                }
            }, {
                type: 'separator'
            }, {
                label: '删除',
                click: function() {
                    message.open([{name: '确定', action: function () {
                        self.removeItem(self.contextMenuId);
                        self.contextMenuId = -1;
                        this.close();
                        MAIN_PAGE.save();
                    }}, {name: '取消', action: 'close'}], "确认删除选择的文件夹?", 'warning')
                }
            }, {
                label: '重命名',
                click: function() {
                    self.editItemId = self.contextMenuId;
                    self.editName = self.treeMap[self.contextMenuId].name;
                }
            }]);
        },
        watch: {
            editItemId(val) {
                var classList = this.$el.classList;
                if (val != -1) {
                    classList.add('tree-editing');
                    Vue.nextTick(() => {
                        var ipt = $(this.$el).find('[data-id="' + val + '"] input')[0];
                        ipt.select();
                    })
                } else {
                    classList.remove('tree-editing');
                    this.$errorBox.hide();
                }
            },
            editName(val) {
                if ($.trim(val) == '') {
                    var $ipt = $(this.$el).find('[data-id="' + this.editItemId + '"] input:eq(0)');
                    var offset = $ipt.offset();
                    offset.top += 25;
                    this.$errorBox.html('必须填写文件夹名称')
                        .css({
                            top: offset.top,
                            left: offset.left,
                            width: $ipt.width()
                        }).show();
                } else {
                    this.$errorBox.hide();
                }
            }
        }
    }
</script>