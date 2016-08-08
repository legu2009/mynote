<template lang="jade">
div#codeBox.code-box
    div.title-box.input-group-sm
        input.form-control.codebox-title(placeholder="请输入标题", v-model="codeTiTle")
        select.form-control.codebox-mode(v-model="codeMode")
            option(v-for="m in modeList", value="{{m}}") {{m}}
        div.btn-group
            label.btn.btn-default.codebox-save(@click="$root.expandBox = !$root.expandBox")
                i.fa.fa-expand(:class="{'fa-expand': !$root.expandBox, 'fa-compress': $root.expandBox}")
        div.btn-group
            label.btn.btn-default.codebox-save(@click="save")
                i.iconfont &#xe603;
        div.btn-group(style="margin-right: 5px;")
            label.btn.btn-default.codebox-save(@click="del")
                i.iconfont &#xe605;
    tag-select(:tag-list="tagList", :tag-sels="tagSels")
    div.codemirror-box.input-group-sm
        pre#aceEditor
</template>
<script>
    var modelist = ace.require("ace/ext/modelist");
    var editor;
    export default {
        data () {
            return {
                codeMode: 'javascript',
                modeList: ['javascript', 'html', 'css', 'json', 'text'],
                codeTiTle: '',
                tagSels: [],
                fileId: ''
            }
        },
        methods: {
            save() {
                if (this.codeTiTle == '') {
                    message.alert('请填写标题');
                    return;
                }
                var text = editor.getValue();
                var selItemId = MAIN_PAGE.selItemId;
                if (!selItemId || selItemId == -1) {
                    message.alert('请选择保存文件夹');
                    return;
                }
                var treeMap = MAIN_PAGE.treeMap;
                var fileMap = MAIN_PAGE.fileMap;
                
                if (!treeMap[selItemId].children) {
                    Vue.set(treeMap[selItemId], 'children', []);
                }
                var children = treeMap[selItemId].children;
                
                var res = modelist.modesByName[this.codeMode.toLowerCase()];
                var ext = res.extensions.split('|')[0];
                var fileId = MAIN_PAGE.selFileId;
                console.log('MAIN_PAGE.selFileId', MAIN_PAGE.selFileId);
                if (!fileId || fileId == -1) {
                    var file = _.insert(children, {
                        type: 'file',
                        parent: selItemId
                    });
                    fileId = file.link = file.id;
                }
                
                var dirPath = '/code/' + fileId + '/';
                if (!fileMap[fileId]) {
                    Vue.set(fileMap, fileId, {});
                }
                $.extend(fileMap[fileId], {
                    tags: this.tagSels,
                    name: this.codeTiTle,
                    desc: text.substr(0, 200),
                    ext: ext,
                    mode: this.codeMode,
                    t: 'code'
                })
                
                mkdirsSync(dirPath);
                fs.writeFile(bookSpacePath + dirPath + this.codeTiTle + '.' + ext, text, function (err) {
                    if (err) throw err;
                    MAIN_PAGE.save();
                    message.alert('保存成功');
                });
                MAIN_PAGE.selFileId = fileId;
                var tagList = MAIN_PAGE.tagList;
                var items = MAIN_PAGE.defTagGroup.items;
                this.tagSels.forEach(function (tag) {
                    if (tagList.indexOf(tag) == -1) {
                        tagList.push(tag);
                        items.push(tag);
                    }
                })
            },
            del() {
                var fileId = this.fileId;
                MAIN_PAGE.fileMap[fileId] = null;
                //可能需要树进行查找
                var children = MAIN_PAGE.treeMap[MAIN_PAGE.selItemId].children;
                var index = children.findIndex(function (item) {
                    return item.id == fileId
                });
                if (index !== -1) {
                    children.splice(index, 1)
                }
                MAIN_PAGE.selFileId = -1;
                this.fileId = -1;
                MAIN_PAGE.save();
            },
            setMode() {
                var res = modelist.modesByName[this.codeMode.toLowerCase()];
                if (res) {
                    editor.session.setMode(res.mode);
                }
            },
            load(fileId) {
                var file = MAIN_PAGE.fileMap[fileId];
                this.fileId = fileId;
                this.codeMode = file.mode;
                this.codeTiTle = file.name;
                this.tagSels = file.tags;
                var dirPath = '/code/' + fileId + '/';
                fs.readFile(bookSpacePath + dirPath + file.name + '.' + file.ext, 'utf8', function (err, data) {
                    if (err) throw err;
                    editor.setValue(data);
                    editor.clearSelection();
                });
            },
            clear() {
                MAIN_PAGE.selFileId = -1;
                this.fileId = -1;
                this.codeMode = 'javascript';
                this.codeTiTle = "";
                this.tagSels = [];
                editor.setValue("");
            }
        },
        ready() {
            editor = ace.edit("aceEditor");
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: false
            });
            this.setMode();
        },
        watch: {
            codeMode(val) {
                this.setMode();
            }
        }
    }
</script>