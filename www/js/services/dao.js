angular.module('services.dao',[])
.factory('Dao',function ($q,Mocks) {
  var listDir = function(path){
    return $q(function (resolve, reject) {
      window.resolveLocalFileSystemURL(path,
      function (fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
          function (entries) {
            resolve(entries);
            console.log("entries");
            console.log(entries);
          },
          function (err) {
            reject(err);
            console.log(err);
          }
        );
      }, function (err) {
        reject(err);
        console.log(err);
      });  
    });
  };

  return  {
    obterArquivosPasta: function (path, tiposArquivo) {
        return Mocks.meusLivros();
        var _curPath = path;
        var _tiposArquivo = tiposArquivo;
        if(arguments.length == 1){
                _curPath = cordova.file.externalRootDirectory;
                _tiposArquivo = path;
        }
        
        var promiseItems = listDir(_curPath);
        var arquivosDefer = $q.defer();
        var that = this;
        promiseItems.then(function (success) {

            var arquivos = [];
            var dirPromises = [];

            for (var i = 0; i < success.length; i++) {          

                if(success[i].isDirectory){
                    dirPromises.push(that.obterArquivosPasta(success[i].nativeURL, _tiposArquivo));
                }else{
                    var endsWith = function (texto, end) {
                        var len = end.length;
                        var s = texto.length - len;
                        var endText = '';
                        for (var i = s; i < texto.length; i++) {
                          endText += texto[i];
                        };

                        return endText == end;
                    };

                    var endsWithAll = function (arquivo, ends) {
                        for (var i = 0; i < ends.length; i++) {
                            var result = endsWith(arquivo.name, ends[i]);
                            if(result){
                                arquivo.extensao = ends[i];
                                return true;
                            }
                        };
                        return false;
                    }

                    if(endsWithAll(success[i], _tiposArquivo)){
                        arquivos.push({
                            Titulo:success[i].name,
                            Caminho:success[i].fullPath,
                            CaminhoInterno:success[i].nativeURL,
                            Extensao: success[i].extensao
                        });
                    }
                }
            };

            $q.all(dirPromises).then(function (items) {
                for (var i = 0; i < items.length; i++) {
                    arquivos = arquivos.concat(items[i]);
                };
                arquivosDefer.resolve(arquivos);
            });

        },function (error) {
            console.log(error);
            arquivosDefer.reject(error);
        });

        return arquivosDefer.promise;
    },
    obterArquivosCache: function () {
      var livros = JSON.parse(localStorage.livros);

      if(!livros){
        return null;
      }

      return livros;
    },
    salvarArquivosCache: function (arquivos) {
        if(!arquivos)
            return;
        var livros = JSON.stringify(arquivos);
        localStorage.livros = livros;
    },
    obterRecentes:function () {
      var recentes = localStorage.recentes;

      if(!recentes)
        return null;

      return JSON.parse(recentes);
    },
    salvarRecente:function (recente) {
    	var recentes = this.obterRecentes();

    	if(!recentes){
    		recentes = [];
        }
        
        var lido = false;
        for(var i = 0; i < recentes.length; i++){
            if(recentes[i].Titulo === recente.Titulo){
                recentes[i].VezesLido++;
                lido = true;
                break;
            }
        }
        
        if(!lido){
            if(!recente.VezesLido){
                recente.VezesLido = 1;
            }
            recentes.push(recente);
        }
    	localStorage.recentes = JSON.stringify(recentes);
    },
    carregarDados:function (caminhoInterno){
        return Mocks.conteudos(caminhoInterno);
    },
    salvarConfig:function(nomeLivro, config){
        var configs = null;

        if(!localStorage.configs){
            configs = {};
        }else{
            configs = JSON.parse(localStorage.configs);
        }

        configs[nomeLivro] = config;

        localStorage.configs = JSON.stringify(configs);
    },
    obterConfig:function(nomeLivro){
        if(!localStorage.configs){ 
            return null;
        }

        var configs = JSON.parse(localStorage.configs);

        return configs[nomeLivro];
    }
  };
})