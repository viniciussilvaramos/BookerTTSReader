angular.module('service.books',['service.common'])
.factory('Livros',function($q, Pagina){
	
	var LivroPdf = function(opcoes){
		var _url = null;
		var _pdf = null;
		var _pagina = null;
		var _numPagina = null;
		var _totalPaginas = null;
		var _opcoes = null
		var _palavrasPorLinha = null;
		var _quantidadeAgrupamento = null;
		var _alinhamento = null;
		
		var _initialize = function(){
			_opcoes = opcoes || {};
			_numPagina = opcoes.numPagina || 1;
			_palavrasPorLinha = opcoes.palavrasPorLinha || 15;
			_url = opcoes.url || '';
			_seletorParagrafo = opcoes.seletorParagrafo || '';
			_seletorPalavra = opcoes.seletorPalavra || '';
			_quantidadeAgrupamento = opcoes.quantidadeAgrupamento || 1;
			
			if(!_url)
				throw new Error("Url para o pdf é obrigatório!");
		}
		
		var _getPagina = function(){
			
			function _obterPagina(){
				var deferred = $q.defer();
				
				_pdf.getPage(_numPagina).then(function(page){
					page.getTextContent({normalizeWhitespace:true}).then(function (textContent) {
						var textoPagina = '';
						for(var i = 0; i < textContent.items.length; i++){
							textoPagina += textContent.items[i].str + " ";
						}

						_pagina = Pagina.criar(textoPagina, _palavrasPorLinha, _quantidadeAgrupamento);
						deferred.resolve(_pagina);
					});
				});
				
				return deferred.promise;
			}
			
			var deferred = $q.defer();
			if(!_pagina){
				if(!_pdf){
					PDFJS.getDocument(_url).then(function(doc) {
						_totalPaginas = doc.numPages;
						_pdf = doc;
						_obterPagina().then(deferred.resolve)
					});
				}else{
					_obterPagina().then(deferred.resolve)
				}
			}else{
				deferred.resolve(_pagina);				
			}
			
			return deferred.promise;
        }
		
		var _procurar = function(seletorParagrafo,seletorPalavra){

			_seletorParagrafo = seletorParagrafo || _seletorParagrafo;
			_seletorPalavra = seletorPalavra || _seletorPalavra;

			return _getPagina().then(function(pagina){
				var pos = pagina.procurar(_seletorParagrafo, _seletorPalavra);
				if(pos){
					pos.seletorPagina = _numPagina;
				}
				return pos;
			});
		}
		
		var _proximo = function(irParaProxima){
			
			function retorno(pagina){
				var pos = pagina.proximo();
				if(pos){
					pos.seletorPagina = _numPagina;
				}
				return pos;
			}
			
			if((_pagina && _pagina.estaNoFim() || irParaProxima) && _numPagina != _totalPaginas){
				_numPagina++;
				_pagina = null;
				return _getPagina().then(retorno);
			}
			
			return _getPagina().then(retorno);
		}
		
		var _anterior = function(irParaAnterior){
			
			function retorno(pagina){
				var pos = pagina.anterior();
				if(pos){
					pos.seletorPagina = _numPagina;
				}
				return pos;
			}
			
			if(!_pagina || ((_pagina.estaNoComeco() || irParaAnterior)&& _numPagina != 1)){
				_numPagina--;
				_pagina = null;
				return _getPagina().then(function(pagina){
					pagina.comecarNoFim();
					return pagina;
				}).then(retorno);				
			}
			
			return _getPagina().then(retorno)
		}
		
		this.proximo = function(irParaProxima){
			return _proximo(irParaProxima);
		}
		
		this.anterior = function(irParaAnterior){
			return _anterior(irParaAnterior);
		}
		
		this.asJson = function(){
			return _getPagina().then(function(pagina){
				return pagina.asJson();
			});
		}
		
		this.procurar = function(seletorParagrafo,seletorPalavra){
			return _procurar(seletorParagrafo,seletorPalavra);
		}
		
		this.estaNoComeco = function(){
			return (_numPagina === 1) && _pagina.estaNoComeco();
		}
		
		this.estaNoFim = function(){
			return (_numPagina === _totalPaginas) && _pagina.estaNoFim();
		}
		
		_initialize();
	}
	
	return {
		obter:function(orpcoes){
			return new LivroPdf(orpcoes);
		}
	}
})