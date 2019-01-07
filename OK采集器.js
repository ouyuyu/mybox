const __version=="1.0v"

var url = "http://www.okzy.co/index.php?m=vod-search";
var dz = new Array();
var type = new Array();
var title = new Array();
$ui.render({
  props: {
    title: "ok采集器",
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
          getting(sender.text);
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
          getting($("sr").text);
        }
      }
    },
    {
      type: "list",
      props: {
        id: "lb",
        bgcolor: $color("clear"), //flag1:调试完删除
        radius: 6
      },
      layout: function(make, view) {
        make.right.left.inset(20);
        make.top.inset(80);
        make.bottom.inset(20);
      },
      events: {
        didSelect: function(sender, indexPath, data) {
          geturl(dz[indexPath.item],title[indexPath.item]);
        }
      }
    }
  ]
});

function getting(txt) {
  //txt=$text.URLEncode(txt)
  $ui.loading(true)
  clearArr()
  $http.post({
    url: url,
    header: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "http://www.okzy.co/index.php?m=vod-search"
    },
    body: {
      submit: "search",
      wd: txt
    },
    handler: function(resp) {
      var data = resp.data;
      //      console.info(data);
      var con = data.match(/<li><span class="tt">.*<\/li>/g);
      //console.info(con);
      for (var i in con) {
        title[i] = con[i].match(/<a href.*<\/a>/g)[0];
        dz[i] = title[i].match(/href.*.html/g)[0];
        title[i] = title[i].replace(/<.*?>/g, "");
        dz[i] = "http://www.okzy.co" + dz[i].replace('href="', "");
        type[i] = con[i].match(/<span.*?(span>)/g)[2];
        type[i] = type[i].replace(/<.*?>/g, "");
      }
      $("lb").data = title;
      $ui.loading(false)
      $("sr").blur()
    }
  });
}

function geturl(wz,name) {
  $http.get({
    url: wz,
    handler: function(resp) {
      var data = resp.data;
      var t = data.match(/<input type="checkbox".*http.*\/>/g);
      t = t.map(function(item) {
        return item.match(/http.*?"/g)[0].replace('"', "");
      });
      var bt=data.match(/\/>.*\$/g)
      bt=bt.map(function(item,index){
        item=item.replace(/\/>/g,"").replace(/\$/g,"")
        if (t[index].indexOf("m3u8")>0){
          item=item+"【m3u8】"
        }
        return item
      })
      var js=data.match(/<div class="vodplayinfo"><span.*\/div>/g)[0].replace(/<.*?>/g,'')
//      console.info(js)
      $ui.menu({
        items: bt,
        handler: function(title, idx) {
          $ui.push({
            props: {
              title: name
            },
            views: [
              {
                type: "video",
                props: {
                  id: "video",
                  src:t[idx]
                },
                layout: function(make, view) {
                  make.left.right.top.inset(20)
                  make.bottom.inset(200)
                },
                events: {}
              },
              {
                type: "label",
                props: {
                  text:js,
                  align:$align.justified,
                  lines:0
                },
                layout: function(make, view) {
                 make.left.right.bottom.inset(20)
                 make.height.equalTo(160)
                }
              }
            ]
          });
        }
      });
    }
  });
}

function clearArr(){
  dz.length=0
  type.length=0
  title.length=0
}
