///<reference path="./ref.d.ts"/>

// auto run of webapps
$(function () {
    var apps = $("*[data-app]");
    for (var i = 0; i < apps.length; ++i) {
        var appRoot = apps[i];
        var appDescriptor = new Coral.Descriptor($(appRoot).attr("data-app"), {
            el: appRoot
        });
        var app = appDescriptor.instanciate(global, global);
        app.run();
    }
});