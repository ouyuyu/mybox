const __version="1.1v"

chenkUpdate()

var urlt="http://www.zhongzisou.net"
var urlmain=new Array()
var titlemain=new Array()
var pg=1
$ui.render({
  props: {
    title: "种子搜",
  },
  views: [
    {
      type: "input",
      props: {
        id: "sr",
        type: $kbType.search,
        placeholder:"输入搜索电影或电视剧的名称"
      },
      layout: function(make, view) {
        make.left.top.inset(20);
        make.height.equalTo(40);
        make.right.inset(140);
      },
      events: {
        returned: function(sender) {
          getList(sender.text,pg);
          $('sr').blur()
        },
        changed:()=>{
          clearAll()
        }
      }
    },
    {
      type: "button",
      props: {
        id: "btn",
        title: "搜索"
      },
      layout: function(make, view) {
        make.right.top.inset(20);
        make.height.equalTo(40);
        make.width.equalTo(100);
      },
      events: {
        tapped: function(sender) {
          getList($("sr").text,pg);
          $('sr').blur()
        }
      }
    },
    {
      type: "list",
      props: {
        id: "lb",
        bgcolor: $color("clear"),
        radius:6
      },
      layout: function(make, view) {
        make.right.left.inset(20);
        make.top.inset(80);
        make.bottom.inset(20);
      },
      events: {
        didSelect: function(sender, indexPath, data) {
          getMag(urlmain[indexPath.item])
        },
        didReachBottom:function(sender){
          $delay(1,function(){
            sender.endFetchingMore()
            pg=pg+1
            getList($("sr").text,pg)
          })
        }
      }
    }
  ]
});
function getList(wd,pg) {
  $http.get({
    url: urlt + "/list/" + encodeURI(wd)+"/rel/"+pg,
    handler: function(resp) {
      var data = resp.data;
      data = data.replace(/\s|\r|\n/g, "");
      data = data.match(/<h4>.*?<\/a>/g);
      var urll = new Array();
      var title = new Array();
      for (i in data) {
        urll[i] = urlt + data[i].match(/<ahref="(.*?)">(.*?)<\/a>/)[1];
        title[i] = data[i]
          .match(/<ahref="(.*?)">(.*?)<\/a>/)[2]
          .replace(/<.*?>/g, "");
      }
      if (title.length==0){$ui.alert("到底了")}
      titlemain=titlemain.concat(title)
      urlmain=urlmain.concat(urll)
      $('lb').data=titlemain
    }
  });
}

function getMag(url) {
  $http.get({
    url: url,
    handler: function(resp) {
      var data = resp.data;
      data = data.replace(/\r|\n|\s/g, "");
      var mag = data.match(/<textarea.*?>(.*?)<\/textarea>/)[1];
      var tap=data.match(/<\/dt>.*?<\/dd>/g)[1].replace(/<.*?>/g,'')
      var filesize=data.match(/<\/dt>.*?<\/dd>/g)[2].replace(/<.*?>/g,'')
      var filecount=data.match(/<\/dt>.*?<\/dd>/g)[3].replace(/<.*?>/g,'')
      var creatdate=data.match(/<\/dt>.*?<\/dd>/g)[4].replace(/<.*?>/g,'')
      $clipboard.text = mag;
      $ui.alert({
        title: "已复制，是否打开迅雷",
        message:'\n\n点击数:'+tap+'\n文件大小:'+filesize+'\n文件数量:'+filecount+'\n创建日期:'+creatdate+'\n',
        actions: [{
            title: "打开",
            handler: ()=>{$app.openURL("thunder://")}
          },
          {
          title: "不了"
          }
        ]
      })
    }
  });
}

function clearAll(){
  urlmain.length=0
  titlemain.length=0
  pg=1
  $('lb').data.length=0
}

function chenkUpdate() {
  $http.get({
    url: "https://raw.githubusercontent.com/ouyuyu/mybox/master/zhongzisou.js",
    handler: function(resp) {
      var data = resp.data;
      var cloudVersion = data.match(/__version="(.*?)v"/)[1];
      if (__version < cloudVersion) {
        $ui.alert({
          title: "检测到新版本",
          message: cloudVersion + "v",
          actions: [
            {
              title: "更新",
              handler: () => {
                $app.openURL(
                  encodeURI(
                    "jsbox://import?name=种子搜&url=https://raw.githubusercontent.com/ouyuyu/mybox/master/zhongzisou.js&icon=icon_055.png"
                  )
                );
                $app.close();
              }
            },
            {
              title: "不了"
            }
          ]
        });
      }
    }
  });
}
