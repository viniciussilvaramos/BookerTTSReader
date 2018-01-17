angular.module('controllers.ConteudoLivro',[])
.controller('ConteudoLivroCtrl',function ($scope, $ionicPlatform, $stateParams, MeusLivros, $q, $ionicLoading, $ionicHistory, $ionicModal, $ionicTabsDelegate) {
	$scope.Titulo = $stateParams.tituloLivro;
	$scope.config = {
		rate: 5,
		idioma: 'en-US',
		tamanhoTexto: 'c16'
	};

	$scope.$on('$ionicView.leave', function() {
        $ionicTabsDelegate.showBar(true);
		$scope.pare();
	});

	$scope.$on('$ionicView.enter', function() {
        $ionicLoading.show({
			template: 'Carregando livro...'
		});
        
        $ionicTabsDelegate.showBar(false);
        
        MeusLivros.obterDadosLivro($stateParams.tituloLivro)
        .then(function(livro){
            MeusLivros.salvarLeituraRecente(livro);
            
            MeusLivros.carregarConteudo(livro)
            .then(function(conteudo){
                $scope.Livro = new Livro(conteudo);
                $scope.conteudo = $scope.Livro.exibicao();
            },function(err){
                alert(err);
            }).finally(function(){
                $ionicLoading.hide();
            });
            
        },function(err){
            alert(err);
        })
        
	});

	$scope.opcoes = function () {

		$ionicModal.fromTemplateUrl('templates/config.html', {
			scope: $scope,
  		}).then(function(modal) {
    		$scope.modal = modal;
    		modal.show();
  		});
	}

	var Livro = function (textoLongo) {
  		var texto = textoLongo;
  		var textoTratado;
  		var counter = 0;

  		var tratarTextoLongo = function (textoLongo) {
  			//Quebra por linha
  			var textoArray = textoLongo.split('. ');
  			var textoTratado = [];

	  		//Adiciona o ponto e transforma em parágrafo
	  		for (var i = 0; i < textoArray.length; i++) {
	  			textoTratado.push(textoArray[i] +'.');
	  		};

  			return textoTratado;
	  	}

  		this.proximoParagrafo = function (opt) {

  			if(!textoTratado){
  				textoTratado = tratarTextoLongo(texto);
  			}
  			if(opt){
	  			if(opt.doComeco){
	  				counter = 0;
	  			}

	  			if(opt.texto){
	  				var index = textoTratado.indexOf(opt.texto);
	  				if(index > -1){
	  					counter = index;
	  				}
	  			}  	
	  		}		

  			if(counter > textoTratado.length){
  				return '';
  			}

  			//Obtem o próximo parágrafo
  			var retorno = {pos: counter, texto: textoTratado[counter]};
  			//aumenta o contador
  			counter++;

  			return retorno;
  		}

  		this.exibicao = function () {

  			if(!textoTratado){
  				textoTratado = tratarTextoLongo(texto);
  			}

  			return textoTratado;
  		}
  	}

  	var ler = function (opt) {
  		if(!$scope.Livro || $scope.pararLeitura)
			return;

		$scope.paragrafo = $scope.Livro.proximoParagrafo(opt);
		angular.element(document.querySelector('.atual')).removeClass('atual');
		angular.element(document.querySelector('.p'+$scope.paragrafo.pos)).addClass('atual');

		if(!$scope.paragrafo.texto)
			return;

		if(window.TTS){
			window.TTS.speak({
		        text: $scope.paragrafo.texto,
		        locale: $scope.config.idioma,
		        rate: ($scope.config.rate / 10)
	        }, function () {
	            ler();
	        }, function (reason) {
	            alert(reason);
	        });
		}
  	}

	$scope.leia = function (opcoes) {
		var opt = opcoes;
		if(!opt && $scope.paragrafo){
			opt = {};
			opt.texto = $scope.paragrafo.texto;
		}  

		$scope.pare().then(function (ok){
			$scope.pararLeitura = false;
			ler(opt);
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
		}
		return deferred.promise;
	}
})
