angular.module('controllers.ConteudoLivroPdf', [])
.controller('ConteudoLivroPdfCtrl',function ($scope, $ionicTabsDelegate, $ionicLoading, $stateParams, $q, MeusLivros, $ionicModal, $ionicScrollDelegate, $timeout){
    $scope.Titulo = $stateParams.tituloLivro;

    $scope.leia = function (seletorParagrafo, seletorPalavra) {
        var opcoes = {};
        if(!seletorParagrafo && !seletorPalavra && $scope.palavraAtual){
            opcoes.seletores = {seletorParagrafo:seletorParagrafo,seletorPalavra:seletorPalavra};
        }  

        $scope.pare().then(function (ok){
            $scope.pararLeitura = false;
            ler(opcoes);
        },function (reject) {
            alert(reject);
        });
    }

    $scope.pare = function () {
        $scope.pararLeitura = true;
        var deferred  = $q.defer();
        if(window.TTS){
            window.TTS.speak('',function () {
                deferred.resolve('ok');
            });
        }else{
            deferred.reject('No tts support');
            //deferred.resolve('No tts support');
        }
        return deferred.promise;
    }

    var ler = function (opcoes) {
        if($scope.pararLeitura){
            return;
        }

        function read(){
            if(window.TTS){
                window.TTS.speak({
                    text: $scope.palavraAtual.texto,
                    locale: $scope.config.idioma,
                    rate: ($scope.config.rate / 10)
                }, function () {
                    if($scope.pararLeitura){
                        return;
                    }

                    ler();
                }, function (reason) {
                    alert(reason);
                });
            }
        }

        var defer = null;

        if(opcoes && opcoes.seletores){
            defer = $scope.procurar(opcoes.seletorParagrafo, opcoes.seletorPalavra);
        }else{
            defer = $scope.proximo();
        }

        defer.then(function(palavra){
            $scope.palavraAtual = palavra;
            read();
        });        
    }
    
    function criarSeletoresPagina(seletorParagrafo, seletorPalavra){
        return { paragrafo: seletorParagrafo, palavra: seletorPalavra };
    }

    function criarReferenciaLivro(caminhoInterno){
        return {
            url: caminhoInterno,
            seletorParagrafo: $scope.config.seletores.paragrafo,
            seletorPalavra: $scope.config.seletores.palavra,
            numPagina: $scope.config.paginaAtual,
            palavrasPorLinha: $scope.config.quantidadePalavras,
            quantidadeAgrupamento : $scope.config.agrupamento
        };
    }

    function atualizar(p){
        var defer = $q.defer();

        function marcacao(p){
            $timeout(function(){
                $scope.config.seletores = criarSeletoresPagina(p.seletorParagrafo, p.seletorPalavra);
                $scope.config.paginaAtual = p.seletorPagina;
                angular.element(document.querySelectorAll(".atual")).removeClass('atual')
                var paragrafo = "." + p.seletorParagrafo;
                var palavra =  paragrafo + ' .' + p.seletorPalavra;
                angular.element(document.querySelector(palavra)).addClass('atual');
                angular.element(document.querySelector(paragrafo)).addClass('atual');
                defer.resolve(p);
            }, 0,false);
        }

        if(!p){
            defer.reject("Não há parágrafo");
            return;
        }
        
        if($scope.config.paginaAtual !== p.seletorPagina){
            $scope.livro.asJson().then(function(json){
                $scope.paragrafos = json;
            }).then(function(){
                marcacao(p);
            });                     
        }else{
            marcacao(p);
        }

        return defer.promise;
        
    }

    $scope.opcoes = function () {

        $ionicModal.fromTemplateUrl('templates/config.html', {
            scope: $scope,
        }).then(function(modal) {
            $scope.modal = modal;
            modal.show();
        });
    }
    
    $scope.proximo = function(irParaProxima){
        return $scope.livro.proximo(irParaProxima).then(atualizar).then(function(p){
        
            if($scope.livro.estaNoFim()){
                alert("Está no fim");
            }

            return p;
        });
    }
    
    $scope.anterior = function(irParaAnterior){
        return $scope.livro.anterior(irParaAnterior).then(atualizar).then(function(p){

            if($scope.livro.estaNoComeco()){
                alert("Está no começo");
            }

            return p;
        });
    }
    
    $scope.procurar = function(seletorParagrafo,seletorPalavra){
        return $scope.livro.procurar(seletorParagrafo,seletorPalavra).then(atualizar);
    }
  
    $scope.$on('$ionicView.enter', function() {
        $ionicLoading.show({
			template: 'Carregando livro...'
		});
       
        $ionicTabsDelegate.showBar(false);
        
         MeusLivros.obterDadosLivro($stateParams.tituloLivro)
        .then(function(livro){
            
            MeusLivros.salvarLeituraRecente(livro);

            $scope.config                    = MeusLivros.obterConfig($stateParams.tituloLivro) || {};
            $scope.config.quantidadePalavras = $scope.config.quantidadePalavras || 15;
            $scope.config.agrupamento        = $scope.config.agrupamento || 4;
            $scope.config.paginaAtual        = $scope.config.paginaAtual || 1;
            $scope.config.alinhamento        = $scope.config.alinhamento || 'left';
            $scope.config.idioma             = $scope.config.idioma || 'en-US';
            $scope.config.rate               = $scope.config.rate || 1.5;
            $scope.config.tamanhoTexto       = $scope.config.tamanhoTexto || 'c16';
            $scope.config.seletores          = $scope.config.seletores || criarSeletoresPagina('p0','w0');

            var referenciaLivro = criarReferenciaLivro(livro.CaminhoInterno);
            $scope.livro = MeusLivros.obterLivro(referenciaLivro); 

            $scope.livro.asJson().then(function(json){
                $scope.paragrafos = json;
            }).then(function(){
                $scope.livro.procurar().then(atualizar);
            }).finally(function(fn){
                $ionicLoading.hide();
            });
        });
	});
    
    $scope.$on('$ionicView.leave', function() {
        MeusLivros.salvarConfig($scope.Titulo, $scope.config);
        $ionicTabsDelegate.showBar(true);
        $scope.pare();
	});

    $scope.$watch('config',function(newVal, oldVal){
        if(newVal !== undefined){
            MeusLivros.salvarConfig($scope.Titulo, newVal);
        }
    }, true);

    /*$scope.definirPagina = function(novaPagina){
        if(novaPagina){
            $scope.Livro.definirPagina(novaPagina).then(atualizarPagina,mostrarErro);
        }

        $scope.config.paginaAtual = $scope.Livro.obterPaginaAtual();

        return $scope.config.paginaAtual;
    }

    $scope.proximaPagina = function(){
        angular.element(document.querySelector('.atual')).removeClass('atual');
        var promArr = [
            $scope.pare(),
            $scope.Livro.proximaPagina().then(atualizarPagina,mostrarErro).then(function(resolve){
                $scope.config.paginaAtual = $scope.Livro.obterPaginaAtual();
                $scope.leia({pos:0});
            })
        ];
        return $q.all(promArr);
    }

    $scope.paginaAnterior = function(){
        angular.element(document.querySelector('.atual')).removeClass('atual');

        var promArr = [
            $scope.pare(),
            $scope.Livro.paginaAnterior().then(atualizarPagina,mostrarErro).then(function(resolve){
                $scope.config.paginaAtual = $scope.Livro.obterPaginaAtual();
                $scope.leia({pos:0});
            })
        ];

        return $q.all(promArr);
    }

    $scope.proximo = function(valor){
        var posAtual = 0;
        var promArr = [];
        if($scope.paragrafo){
            posAtual = $scope.paragrafo.pos;

            if(posAtual == 0 && valor < 0){
                promArr.push(
                    $scope.paginaAnterior().then(function(res){
                        posAtual = $scope.Livro.quantidadeParagrafos() -1;
                    })
                );
            }
        }
        $q.all(promArr).then(function(){
            $scope.leia({pos:posAtual + valor});
        })
    }

    var atualizarPagina = function(texto){
        $scope.paragrafos = texto;
    };

    var mostrarErro = function(){
        alert(err);
    }

    */
});