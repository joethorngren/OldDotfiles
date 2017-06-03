var sponsorGroupId = "10000000000010";

if (!localStorage.getItem("sd.install_time")) {
    localStorage.setItem("sd.install_time", new Date().getTime());
} //if

ServerDials
    .setInstallTime(
        Math.round(parseInt(localStorage.getItem("sd.install_time")) / 1000)
    )
    .setClientSoftware("lsp_chome") //lsp_ff
    .setConfig("minVisits", 4)
    .setConfig("userType", "new");

ServerDials.setMapClass(function () {
    var serverGroupsIds = {};
    this.init = function (serverDials, cb) {
        //console.log("INIT", serverDials);

        //console.log("init serverdials mapper");
        var serverGroupsMap = {};
        serverDials.forEach(function (serverDial) {
            serverGroupsMap[serverDial.group.globalId] = serverDial.group;
        });
        var serverGroupsGlobalIds = Object.keys(serverGroupsMap);
        //console.log("found server groups", serverGroupsGlobalIds);

        cb();

    };
    this.map = function (serverDial) {
        var dial = {
            "id": createDialId(serverDial.url, sponsorGroupId),
            "groupId": sponsorGroupId,
            "url": serverDial.url,
            "title": serverDial.title,
            "addDate": Date.now(),
            "orderNum": 0,
            "image": null,
            "bg_color": null,
            "text_color": null,
            "thumb_type": null,
            "is_deleted": 0
        };

        if (serverDial.previewUrl) {
            dial.image = serverDial.previewUrl;
            dial.thumb_type = 2;
        } else {
            dial.thumb_type = 2;
        }

        //console.log("MAP", dial);

        return dial;
    };
});

ServerDials.onDialsUpdate.addListener(function (dials) {
    var defaultGroupId;
    //console.log("onDialsUpdate", dials);

    addSponsorDials(dials);//???
});

BRW_langLoaded(function(){BRW_getFileSystem(function(){
    FF_whileLoaded(function () {
        setTimeout(function(){
            var install = parseInt(localStorage.getItem("install-key") || 0);
            var checked = localStorage.getItem("dials-installed") || false;
            var now = Date.now();
            
            if(
                !checked && 
                (
                    install == 0 ||
                    (now - install) < (10 * 60 *1000)
                )
            )
            ServerDials.fetch({
                userType: "new"
            }, function (err, dials) {
                //console.log("FETCHED", dials);
                if (err) {
                    groupDials = [];
                    console.error("Fail to fetch dials from the server", err);
                } else {
                    //console.info("Fetched", dials.length, " dials from the server");
                    groupDials = dials;
                }

                //next();
                addSponsorDials(dials);
            });
            
            
        }, 350);
    }, function () {
        return (typeof CNT !== "undefined") ? true : false;
    }, {
        name: "Wait for CNT"
    });
});});
    
function addSponsorDials(dials) {
    //console.log("addSponsorDials", dials);

    if (dials && dials.length) {
        BRW_dbTransaction(function (tx) {
            BRW_dbSelect({ //Check group
                    tx: tx,
                    from: 'GROUPS',
                    where: {
                        'id': sponsorGroupId
                    }
                },
                function (grp) { //Success
                    if (grp.rows.length == 0) {
                        var insert = {
                            id: sponsorGroupId,
                            type: 1,
                            title: translate("group_sponsoredst"),
                            addDate: Date.now(),
                            orderNum: 2
                        };

                        BRW_dbInsert({ //Param
                                tx: tx,
                                table: 'GROUPS',
                                'set': insert,
                                //passive: ['groups', 'dials']
                            },
                            function () {
                                //createSponsorDials(serverDials);
                            }, //success
                            function () {}
                        );
                    } //if

                    BRW_dbSelect({ //Param
                            tx: tx,
                            from: 'DIALS',
                            where: {
                                'groupId': sponsorGroupId,
                                //'is_deleted': 0
                            }
                        },
                        function (results) { //Success
                            var orderNum = 0,
                                count = 0;

                            //console.log("DIALS", results);

                            if (results.rows.length > 0) {
                                for (var key in results.rows)
                                    if (results.rows[key].id) {
                                        var val = results.rows[key];

                                        //console.log(val);

                                        for (var k in dials)
                                            if (dials[k].id == val.id) {
                                                dials.splice(k, 1);
                                                break;
                                            } //for

                                        orderNum = Math.max(orderNum, parseInt(val.orderNum));
                                        count++;
                                    } //for
                            } //if

                            if (dials.length == 0) return;

                            for (var key in dials) {
                                dials[key].orderNum = orderNum++;
                                
                                //console.log("Write DB:", dials[key]);
                                BRW_dbInsert({ //Param
                                        tx: tx,
                                        table: 'DIALS',
                                        'set': dials[key]
                                    }
                                    //,function(res){console.log(res)}
                                    //,function(res, dsc){console.warn(res, dsc)}
                                );
                            } //for

                            localStorage.setItem("dials-installed", 1);
                            
                            setTimeout(function () {
                                if(typeof refreshSidebarGroups == "function"){
                                    refreshSidebarGroups();
                                }else{
                                    BRW_sendMessage({
                                        command: "refreshSidebarGroups"
                                    });
                                }//else
                                
                            }, 165);

                            //sendDialResponse(dial.id, sendResponse);
                            //bgMoveDialsOrder(dials);
                        } //Success    
                    );
                } //Success
            );
        });
    } //if
} //function