'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// <template lang="jade">
// div#favoriteBox.code-box
//     div.title-box.input-group-sm
//         input.form-control.codebox-title(placeholder="请输入标题", v-model="title")
//         div.btn-group
//             label.btn.btn-default.codebox-save(@click="$root.expandBox = !$root.expandBox")
//                 i.fa.fa-expand(:class="{'fa-expand': !$root.expandBox, 'fa-compress': $root.expandBox}")
//         div.btn-group
//             label.btn.btn-default.codebox-save(@click="save")
//                 i.iconfont &#xe603;
//         div.btn-group(style="margin-right: 5px;")
//             label.btn.btn-default.codebox-save(@click="del")
//                 i.iconfont &#xe605;
//     div.title-box.input-group-sm
//         input.form-control.codebox-title(placeholder="地址", v-model="url", @keyup.enter="go2url")
//         div.btn-group
//             label.btn.btn-default.codebox-save(style="padding: 1px 11px 1px 9px;", @click="back2url")
//                 i.fa.fa-play(style="transform: rotate(180deg);")
//         div.btn-group
//             label.btn.btn-default.codebox-save(style="padding: 1px 9px 1px 11px;", @click="go2url")
//                 i.fa.fa-play
//     tag-select(:tag-list="tagList", :tag-sels="tagSels")
//     div.codemirror-box.input-group-sm
//         webview#webview(src="data:text/plain,"  plugins)
// </template>
// <script>
var wkLoad;
var webview;
exports.default = {
    data: function data() {
        return {
            title: '',
            url: '',
            tagSels: [],
            fileId: '',
            pageTitle: ''
        };
    },

    methods: {
        save: function save() {
            if (this.title == '') {
                message.alert('请填写标题');
                return;
            }
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
            var fileId = MAIN_PAGE.selFileId;
            if (!fileId || fileId == -1) {
                var file = _.insert(children, {
                    type: 'file',
                    parent: selItemId
                });
                fileId = file.link = file.id;
            }

            if (!fileMap[fileId]) {
                Vue.set(fileMap, fileId, {});
            }
            $.extend(fileMap[fileId], {
                tags: this.tagSels,
                name: this.title,
                url: this.url,
                desc: this.pageTitle,
                t: 'favorite'
            });

            MAIN_PAGE.selFileId = fileId;
            var tagList = MAIN_PAGE.tagList;
            var items = MAIN_PAGE.defTagGroup.items;
            this.tagSels.forEach(function (tag) {
                if (tagList.indexOf(tag) == -1) {
                    tagList.push(tag);
                    items.push(tag);
                }
            });
            MAIN_PAGE.save();
            message.alert('保存成功');
        },
        go2url: function go2url() {
            var reg = /https?\:\/{1,}/;
            if (!reg.test(this.url)) {
                this.url = 'http://' + this.url;
            }
            var url = this.url;
            wkLoad.then(function () {
                webview.loadURL(url);
            });
        },
        back2url: function back2url() {
            webview.goBack();
        },
        load: function load(fileId) {
            var file = MAIN_PAGE.fileMap[fileId];
            this.fileId = fileId;
            this.title = file.name;
            this.tagSels = file.tags;
            var flag = this.url == file.url;
            this.url = file.url;
            if (!flag) this.go2url();
        },
        del: function del() {
            var fileId = this.fileId;
            MAIN_PAGE.fileMap[fileId] = null;
            //可能需要树进行查找
            var children = MAIN_PAGE.treeMap[MAIN_PAGE.selItemId].children;
            var index = children.findIndex(function (item) {
                return item.id == fileId;
            });
            if (index !== -1) {
                children.splice(index, 1);
            }
            MAIN_PAGE.selFileId = -1;
            this.fileId = -1;
            MAIN_PAGE.save();
        },
        clear: function clear() {
            MAIN_PAGE.selFileId = -1; //
            this.fileId = -1;
            this.title = '';
            this.tagSels = [];
            this.pageTitle = "";
            this.url = '';
            wkLoad && wkLoad.then(function () {
                webview.loadURL('data:text/plain,');
            });
        }
    },
    ready: function ready() {
        console.log('ready');
        webview = this.$el.querySelector('webview');
        var self = this;
        webview.addEventListener('close', function () {
            webview.src = 'data:text/plain,';
        });

        webview.addEventListener('did-navigate-in-page', function (url) {
            console.log('did-navigate-in-page', url);
        });
        webview.addEventListener('will-navigate', function (url) {
            console.log('will-navigate', url);
        });
        wkLoad = new Promise(function (resolve) {
            webview.addEventListener('dom-ready', function () {
                resolve();
            });
        });
        webview.addEventListener('did-navigate', function (opt) {
            if (opt.url != 'data:text/plain,') self.url = opt.url;else self.url = '';
        });
        webview.addEventListener('new-window', function (opt) {
            webview.loadURL(opt.url);
        });
        webview.addEventListener('page-title-updated', function (opt) {
            self.pageTitle = opt.title;
        });
    }
};
// </script>

;exports.default.template = '<div id="favoriteBox" class="code-box"><div class="title-box input-group-sm"><input placeholder="请输入标题" v-model="title" class="form-control codebox-title"/><div class="btn-group"><label @click="$root.expandBox = !$root.expandBox" class="btn btn-default codebox-save"><i :class="{\'fa-expand\': !$root.expandBox, \'fa-compress\': $root.expandBox}" class="fa fa-expand"></i></label></div><div class="btn-group"><label @click="save" class="btn btn-default codebox-save"><i class="iconfont">&#xe603;</i></label></div><div style="margin-right: 5px;" class="btn-group"><label @click="del" class="btn btn-default codebox-save"><i class="iconfont">&#xe605;</i></label></div></div><div class="title-box input-group-sm"><input placeholder="地址" v-model="url" @keyup.enter="go2url" class="form-control codebox-title"/><div class="btn-group"><label style="padding: 1px 11px 1px 9px;" @click="back2url" class="btn btn-default codebox-save"><i style="transform: rotate(180deg);" class="fa fa-play"></i></label></div><div class="btn-group"><label style="padding: 1px 9px 1px 11px;" @click="go2url" class="btn btn-default codebox-save"><i class="fa fa-play"></i></label></div></div><tag-select :tag-list="tagList" :tag-sels="tagSels"></tag-select><div class="codemirror-box input-group-sm"><webview id="webview" src="data:text/plain," plugins="plugins"></webview></div></div>';