var fs = require('fs');
var path = require('path');
var http = require('http');
var mime = require('mime');
var cache = {};

//发送错误响应
function send404(response){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found');
    response.end();
}
//发送文件数据服务
function sendFile(response, filePath, fileContents){
    response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}
//提供静态文件服务
function serveStatic(response, cache, absPath){
    if(cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    }else{
        fs.exists(absPath, function(exists){
            if(exists){
                fs.readFile(absPath, function(err, data){
                    if(err){
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                })
            }else{
                send404(response);
            }
        })
    }
}

//创建HTTP服务器逻辑
var server =  http.createServer(function(req, res){
    var filePath = false;

    if (req.url == '/'){
        filePath = 'public/index.html';
    }else{
        filePath = 'public' + req.url;
    }
    var absPath = './' + filePath;
    serveStatic(res, cache, absPath);
});
server.listen(3003, function(){
    console.log('chatRooms Server listen on port 3003.')
});
