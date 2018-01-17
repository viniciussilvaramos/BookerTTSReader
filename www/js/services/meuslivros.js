angular.module('services.livros', ['services.dao','services.mocks','service.books'])
.factory('MeusLivros', function ($q, Dao, Livros) {
  return{
//    cacheados:function () {
//      return $q(function (resolve,reject) {
//          try {
//            resolve(Dao.obterArquivosCache());
//          }catch(err) {
//            reject(err);
//          }         
//      });
//    },
    encontre:function () {
        var resultado = Dao.obterArquivosPasta(['.txt','.pdf','.epub']);
//         resultado.finally(function (resultado) {
//           Dao.salvarArquivosCache(resultado);
//         })
        return resultado;
    },
    obterRecentementeLidos:function () {
      return $q(function (resolve,reject) {
        try{
          var recentes = Dao.obterRecentes();
          resolve(recentes);
          console.log("Há " + recentes.Count + " livros recentemente lidos.");
        }catch(err){
          reject(err);
        }
      });
    },
    salvarLeituraRecente:function (livro) {
      return $q(function (resolve, reject) {
        try{ 
          console.log("O livro " + livro.Titulo + " esta sendo salvo como leitura recente.");    
          Dao.salvarRecente(livro);
          resolve('ok');
        }catch(err){
          reject(err);
        }
      });
    },
    obterDadosLivro:function(tituloLivro){
        var that = this;
        return $q(function(resolve,reject){
            that.encontre()
            .then(function(success){
                var arquivos = success;
                if(!arquivos){
                    reject(null);
                    return;
                }   
                
                for(var i = 0; i < arquivos.length; i++){
                    if(arquivos[i].Titulo == tituloLivro){
                        resolve(arquivos[i]);
                        return;
                    }
                }
        
                reject(null); 
            },function(err){
                reject(err); 
            });
        });
    },
    carregarConteudo:function(livro){
      return Dao.carregarDados(livro.CaminhoInterno);        
    },
    salvarConfig:function(nomeLivro, config){
        Dao.salvarConfig(nomeLivro, config);
    },
    obterConfig:function(nomeLivro){
        var config = Dao.obterConfig(nomeLivro);
        if(!config)
            return null;
    
        config.quantidadePalavras = parseInt(config.quantidadePalavras);
        config.agrupamento        = parseInt(config.agrupamento);
        config.paginaAtual        = parseInt(config.paginaAtual);
        config.rate               = parseFloat(config.rate);

        return config;
    },
    obterLivro:function(opcoes){
        return Livros.obter(opcoes);
    },
    criarLivro1:function(caminhoInterno){
      var LivroPdf = function(caminhoInterno){
        var url = caminhoInterno;
        var pdf = null;
        var pagina = 0;
        var totalPaginas = 0;
        var _textoLeitura = null;
        var _paragrafoAtual = "p0";
        var _palavraAtual = "w0";

        var Doc = function(textoLongo, palavrasPorLinha){
            var _original = textoLongo;
            var _separado = _tratarTexto();
            var _linhas = [];
            var _palavrasPorLinha = palavrasPorLinha ? palavrasPorLinha : 10;
            
            function _tratarTexto(){
                return _original.replace(/(\n|\r|\r\n|(\[[0-9]+?\])|- )/gim, ' ').split(" ");
            }
            
            var _criarLinha = function(){
                return new Linha(_palavrasPorLinha);
            };
                            
            var _obterLinhas = function(){
                if(_linhas.length === 0){
                    var linha = _criarLinha();
                    _linhas.push(linha);
                    _separado.forEach(function(item, index, arr){
                        if(linha.estaCompleta()){
                            linha = _criarLinha();
                            _linhas.push(linha);
                        }
                    
                        linha.montar(item);
                    });
                }
                
                return _linhas;
            };
            
            this.asJson = function(){
                var retorno = [];
                
                _linhas.forEach(function(linha, index){
                    retorno.push({classe:'p'+index , linhas: linha.asJson()});
                });
                
                return retorno;
            }
            
            this.exibir = function(){
            
                var html = '';
                
                _linhas.forEach(function(item){
                    html += item.exibir();
                });
                
                return html;
            };
            
            _obterLinhas();
        };
        
        var Linha = function(quantidadePalavras){
            var _texto = [];
            var _completa = false;
            var _quantidadePalavras = quantidadePalavras ? quantidadePalavras : 10;
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
                var retorno = [];
                _texto.forEach(function(palavra,index){
                    retorno.push({classe:'w'+index, texto: palavra});
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
                if(fimConclusivo){
                }
                var fimLinha = _pontuado(palavra, _pontuacao.possivelFim) && palavra.length >= 5;
                                
                if(fimConclusivo || (fimLinha || _texto.length === _quantidadePalavras)){
                    _completa = true;
                }
            };
        };

        var load = function(){
            return new $q(function(resolve,reject){
                try{
                    PDFJS.getDocument(url).then(function(_pdf) {
                        pdf = _pdf;
                        totalPaginas = _pdf.numPages;

                        resolve();
                    });
                }catch(ex){
                    reject(ex);
                }
            });
        };

        var paginaPdfTexto = function(novaPagina){
            return new $q(function(resolve,reject){
                try{
                    if(novaPagina){
                        pagina = parseInt(novaPagina);
                    }
                    pdf.getPage(pagina).then(function(page){
                        page.getTextContent({normalizeWhitespace:true}).then(function (textContent) {
                            var linhas = [];
                            var pagina = '';
                            for(var i = 0; i < textContent.items.length; i++){
                                pagina += textContent.items[i].str + " ";
                            }

                            var doc = new Doc(pagina, 20);

                            _textoLeitura = doc.asJson();
                            resolve(_textoLeitura);
                        });
                    });
                }catch(ex){
                    reject(ex);
                }
            });
        }

        var _obterProximo = function(){
            
        }

        this.proximoParagrafo = function(opt){
            // if(!_textoLeitura || _textoLeitura.length == 0 || _textoLeitura.length <= posLeituraAtual){
            //     return;
            // }

            var opt = {
                pos : {
                    classePagrafo : "p0",
                    classePalavra : "w6" 
                }
            }            

            if(opt){
                if(opt.doComeco){
                    posLeituraAtual = 0;
                }

                if(opt.pos !== undefined){

                    var item  = Enumerable.From(_textoLeitura)
                        .Where(function(x){
                            return x.classe === opt.pos.classePagrafo;
                        })
                        .Select(function(x){
                            return Enumerable.From(x.linhas)
                                .Where(function(y){
                                    return y.classe === opt.pos.classePalavra;
                                }).Select(function(y){
                                    return y.texto;
                                }).Single();
                        }).Single();
                }  
            }

            var retorno = {texto:_textoLeitura[posLeituraAtual], pos:posLeituraAtual};
            posLeituraAtual++;
            return retorno;
        }

        this.obterTotalPaginas = function(){
            return totalPaginas;
        }

        this.obterPaginaAtual = function(){
            return pagina;
        }

        this.definirPagina = function(pagina){
            return paginaPdfTexto(pagina);
        }

        this.proximaPagina = function(proxPagina){
            posLeituraAtual = 0;

            if(!proxPagina){
                pagina++;
            }else{
                pagina = proxPagina;
            }
            
            if(pagina > totalPaginas && totalPaginas){
                pagina = totalPaginas;
            }
            if(!pdf){
               return load().then(paginaPdfTexto,this.onError)
            }else{
                return paginaPdfTexto();
            }
        };

        this.paginaAnterior = function(){
            posLeituraAtual = 0;
            pagina--;
            if(pagina < 1){
                pagina = 1;
            }
            if(!pdf){
               return load().then(paginaPdfTexto,this.onError)
            }else{
                return paginaPdfTexto();
            }
        };

        this.quantidadeParagrafos = function(){
            return _textoLeitura.length;
        }

      }

      return new LivroPdf(caminhoInterno);
    }
  };  
});