angular.module('service.common',[])
.factory('Pagina',function(Ponteiro,Doc){
	var Pagina = function(textoLongo, quantidadePalavrasPorLinha, quantidadeAgrupamento){
		var _doc = null;
		var _paragrafos = null;
		var _linhas = null;
		var _paragrafoAtual = null;
		var _quantidadeAgrupamento = null;
			
		var _initialize = function(){
			_quantidadeAgrupamento = quantidadeAgrupamento || 1;
			_doc = Doc.criar(textoLongo, quantidadePalavrasPorLinha, _quantidadeAgrupamento);
			_paragrafos = Ponteiro.criar(_doc.asJson());
		}
	
		var _procurar = function(seletorParagrafo, seletorPalavra){
			_paragrafoAtual = _paragrafos.procurar(seletorParagrafo)
			
			if(!_paragrafoAtual){
				return null;
			}
			
			_linhas = Ponteiro.criar(_paragrafoAtual.linhas);
			if(!_linhas){
				return null;
			}
			
			var palavra = _linhas.procurar(seletorPalavra);
			if(!palavra){
				return null;
			}
			return {
				seletorParagrafo: _paragrafoAtual.classe,
				seletorPalavra: palavra.classe,
				texto : palavra.texto
			}
		}
		
		var _proximo = function(){
			if(!_linhas || _linhas.estaNoFim()){
				if(_paragrafos.estaNoFim()){
					return null;
				}
				
				_paragrafoAtual = _paragrafos.proximo();
				_linhas = Ponteiro.criar(_paragrafoAtual.linhas);
			}
			
			var palavra = _linhas.proximo();
			
			return {
				seletorParagrafo: _paragrafoAtual.classe,
				seletorPalavra: palavra.classe,
				texto : palavra.texto
			}
			
		}
		
		var _anterior = function(){
			if(!_linhas || (_paragrafos.estaNoComeco() && _linhas.estaNoComeco())){
				return null;
			}
			
			if(_linhas.estaNoComeco()){
				_paragrafoAtual = _paragrafos.anterior();
				_linhas = Ponteiro.criar(_paragrafoAtual.linhas);
				_linhas.comecarNoFim();
			}
			
			var palavra = _linhas.anterior();
			return {
				seletorParagrafo: _paragrafoAtual.classe,
				seletorPalavra: palavra.classe,
				texto : palavra.texto
			}
		}
	
		this.proximo = function(){
			return _proximo();
		}
		
		this.procurar = function(seletorParagrafo, seletorPalavra){
			return _procurar(seletorParagrafo, seletorPalavra);
		}
		
		this.anterior = function(){
			return _anterior();
		}
		
		this.comecarNoFim = function(){
			_paragrafos.comecarNoFim();
			_paragrafoAtual = _paragrafos.anterior();
			_linhas = Ponteiro.criar(_paragrafoAtual.linhas);
			_linhas.comecarNoFim();
		}
		
		this.estaNoComeco = function(){
			return (!_linhas || (_paragrafos.estaNoComeco() && _linhas.estaNoComeco()));
		}
		
		this.estaNoFim = function(){
			return (_linhas && _paragrafos.estaNoFim() && _linhas.estaNoFim());
		}
		
		this.asJson = function(){
			return _doc.asJson();
		}
	
		_initialize();
	}

	return {
		criar:function(textoLongo, quantidadePalavrasPorLinha, quantidadeAgrupamento){
			return new Pagina(textoLongo, quantidadePalavrasPorLinha, quantidadeAgrupamento);
		}
	}
})
.factory('Doc',function(Linha){
	var Doc = function(textoLongo, palavrasPorLinha, quantidadeAgrupamento){
		var _original = textoLongo;
		var _separado = _tratarTexto();
		var _listas = [];
		var _listaPorLinha = palavrasPorLinha || 10;
		var _quantidadeAgrupamento = quantidadeAgrupamento || 1;
						
		function _tratarTexto(){
			return _original.replace(/(\n|\r|\r\n|(\[[0-9]+?\])|- )/gim, '').split(" ").filter(function(item){
				return item !== '';
			});
		}
						
		var _criarLinha = function(){
			return Linha.criar(_listaPorLinha, _quantidadeAgrupamento);
		};
										
		var _obterLinhas = function(){
			if(_listas.length === 0){
				var linha = _criarLinha();
				_listas.push(linha);
				_separado.forEach(function(item, index, arr){
					if(linha.estaCompleta()){
						linha = _criarLinha();
						_listas.push(linha);
					}
				
					linha.montar(item);
				});
			}
			
			return _listas;
		};
		
		this.asJson = function(){
			var retorno = [];
			
			_listas.forEach(function(linha, index){
				retorno.push({classe:'p'+index , linhas: linha.asJson()});
			});
			
			return retorno;
		}
		
		this.exibir = function(){
		
			var html = '';
			
			_listas.forEach(function(item){
				html += item.exibir();
			});
			
			return html;
		};
		
		_obterLinhas();
	};

	return {
		criar:function(textoLongo, palavrasPorLinha, quantidadeAgrupamento){
			return new Doc(textoLongo, palavrasPorLinha, quantidadeAgrupamento);
		}
	}
})
.factory('Linha',function(){
	var Linha = function(quantidadePalavras, palavrasPorAgrupamento){
		var _texto = [];
		var _completa = false;
		var _quantidadePalavras = quantidadePalavras || 10;
		var _palavrasPorAgrupamento = palavrasPorAgrupamento || 1;
		var _pontuacao = {
			possivelFim: ['.'],
			fimConclusivo: ['?','!',';',':']
		}
		
		var _pontuado = function(palavra, pontos){
			var resultado = false;
			var ultimoChar = palavra[palavra.length-1];
			
			pontos.forEach(function(pontuacao){
				resultado  = resultado || ultimoChar === pontuacao;
			});
			
			return resultado;
		};
		
		this.asJson = function(){
			var agrupado = [];
			var agrupamento = [];
			var retorno = [];
			
			_texto.forEach(function(palavra, index){
				agrupamento.push(palavra);
				
				if(agrupamento.length === _palavrasPorAgrupamento || index === _texto.length-1){
					agrupado.push(agrupamento);
					agrupamento = [];
				}
			});
			
			agrupado.forEach(function(agrupamento,index){
				retorno.push({classe:'w'+index, texto: agrupamento.join(' ')});
			});
			return retorno;
		}
		
		this.exibir = function(){
			var retorno = "<p>";
			_texto.forEach(function(item){
				retorno += "<span>"+item+"</span>";
			});
			retorno += "</p>";
			
			return retorno;
		};
		
		this.estaCompleta = function(){
			return _completa;
		};
		
		this.montar = function(palavra){
			_texto.push(palavra);
			
			var fimConclusivo = _pontuado(palavra, _pontuacao.fimConclusivo);
			var fimLinha = _pontuado(palavra, _pontuacao.possivelFim) && palavra.length >= 5;
							
			if(fimConclusivo || (fimLinha || _texto.length === _quantidadePalavras)){
				_completa = true;
			}
		};
	};	
	return {
		criar:function(quantidadePalavras, palavrasPorAgrupamento){
			return new Linha(quantidadePalavras, palavrasPorAgrupamento);
		}
	}
})
.factory('Ponteiro',function(){
	var Ponteiro = function(lista){
		var _minimo = null;
		var _maximo = null;
		var _lista = null;
		var _atual = null;
		var _seletores = null;
		var _posicaoMaxima = null;
		var _posicaoMinima = null;
		var _retornarUltimo = null;
			
		var _initialize = function(){
			_lista = lista;
			_posicaoMaxima = _lista.length - 1;
			_posicaoMinima = 0;
			_maximo = _lista[_lista.length - 1].classe;
			_minimo = _lista[0].classe;
			_seletores = Enumerable.From(_lista)
							.Select(function(x){
								return x.classe;
							})
							.ToArray();
		}
		
		var _procurar = function(seletor){
			if(_seletores.indexOf(seletor) === -1){
				return null;
			}
			
			var item = Enumerable.From(_lista)
						.Where(function(x){
							return x.classe === seletor
						}).Single();
			_atual = item.classe;
			return item;
		}
		
		var _proximo = function(){
			var posicao = _seletores.indexOf(_atual);
			var proximo = posicao+1;
			
			if(proximo > _posicaoMaxima){
				return null;
			}
			_atual = _seletores[proximo];
			return _lista[proximo];
		}
		
		var _anterior = function(){
			var posicao = _seletores.indexOf(_atual);
			
			if(_retornarUltimo){
				_retornarUltimo = false;
				return _lista[posicao];
			}
		
			var anterior = posicao-1;
			
			if(anterior < _posicaoMinima){
				return null;
			}
			_atual = _seletores[anterior];
			return _lista[anterior];
		}
		
		this.comecarNoFim = function(){
			var ultimoSeletor = _seletores[_seletores.length - 1];
			_atual = ultimoSeletor;
			_retornarUltimo = true;
		}
		
		this.estaNoFim = function(){
			return _atual === _maximo;
		}
		
		this.estaNoComeco = function(){
			return _atual === _minimo;
		}
		
		this.procurar = function(seletor){
			return _procurar(seletor);
		}
		
		this.anterior = function(){
			return _anterior();
		}
		
		this.proximo = function(seletor){	
			return _proximo();
		}
		
		_initialize();
	};

	return {
		criar:function(lista){
			return new Ponteiro(lista);
		}
	}
});


				




