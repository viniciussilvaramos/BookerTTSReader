angular.module('services.mocks',[])
.factory('Mocks',function($q,$http){
    
    var livros = [
        {Titulo:'Don\'t Shoot'    ,Caminho:'/mocks/books/Don\'t Shoot.txt'     ,CaminhoInterno:'mocks/books/Don\'t Shoot.txt'   , Extensao:'.txt'},
        {Titulo:'Rattle OK'       ,Caminho:'/mocks/books/Rattle OK.txt'        ,CaminhoInterno:'mocks/books/Rattle OK.txt'      , Extensao:'.txt'},
        {Titulo:'Shamar\'s War'   ,Caminho:'/mocks/books/Shamar\'s War.txt'    ,CaminhoInterno:'mocks/books/Shamar\'s War.txt'  , Extensao:'.txt'},
        {Titulo:'The Amateurs'    ,Caminho:'/mocks/books/The Amateurs.txt'     ,CaminhoInterno:'mocks/books/The Amateurs.txt'   , Extensao:'.txt'},
        {Titulo:'The Deep One'    ,Caminho:'/mocks/books/The Deep One.txt'     ,CaminhoInterno:'mocks/books/The Deep One.txt'   , Extensao:'.txt'},
        {Titulo:'The Waker Dreams',Caminho:'/mocks/books/The Waker Dreams.txt',CaminhoInterno:'mocks/books/The Waker Dreams.txt', Extensao:'.txt'},
        {Titulo:'Why- A Guide to Finding and Using Causes',Caminho:'/mocks/books/Why- A Guide to Finding and Using Causes.pdf',CaminhoInterno:'mocks/books/Why- A Guide to Finding and Using Causes.pdf', Extensao:'.pdf'}

    ];
    
    var conteudo = [
        {CaminhoInterno:'mocks/books/Don\'t Shoot.txt'},
        {CaminhoInterno:'mocks/books/Rattle OK.txt'},
        {CaminhoInterno:'mocks/books/Shamar\'s War.txt'},
        {CaminhoInterno:'mocks/books/The Amateurs.txt'},
        {CaminhoInterno:'mocks/books/The Deep One.txt'},
        {CaminhoInterno:'mocks/books/The Wakecr Dreams.txt'},
        {CaminhoInterno:'mocks/books/Why- A Guide to Finding and Using Causes.pdf'},
    ];
    
    return{
        meusLivros:function(){
            return $q(function(resolve){
                resolve(livros);
            });
        },
        conteudos:function(caminhoInterno){
            return $http.get(caminhoInterno)
                .then(function(success){
                    return success.data;
                },function(err){
                    return err;
                });
        }
    }
})


var textoLongo = 
      "The mechanical voice spoke solemnly, as befitted the importance of its \
message. There was no trace in its accent of its artificial origin. \"A \
Stitch in Time Saves Nine,\" it said and lapsed into silence. \
Even through his overwhelming sense of frustration at the ambiguous \
answer the computer had given to his question, John Bristol noticed \
with satisfaction the success of his Voder installation. He wished that \
all of his innovations with the machine were as satisfying. \
Alone in the tremendous vaulted room that housed the gigantic \
calculator, Bristol clasped his hands behind his back and thrust \
forward a reasonably strong chin and a somewhat sensuous lower lip \
in the general direction of the computer's visual receptors. After \
a moment of silence, he scratched his chin and then shrugged his \
shoulders slightly. \"Well, Buster, I suppose I might try rephrasing the \
question,\" he said doubtfully. \
Somewhere deep within the computer, a bank of relays chuckled briefly. \
\"That expedient is open to you, of course, although it is highly \
unlikely that any clarification will result for you from my answers. I \
am constrained, however, to answer any questions you may choose to ask.\" \
Bristol hooked a chair toward himself with one foot, straddled it and \
folded his arms over the back of it, without once removing his eyes \
from the computer. \"All right, Buster. I'll give it a try, anyway. What \
does 'A Stitch in Time' mean, as applied to the question I asked you?\" \
The calculator hesitated, as if to ponder briefly, before it answered. \
\"In spite of the low probability of such an occurrence, the Solar \
Confederation has been invaded. My answer to your question is an \
explanation of how that Confederation can be preserved in spite of its \
weaknesses--at least for a sufficient length of time to permit the \
staging of successful counter-measures of the proper nature and the \
proper strength.\" \
Bristol nodded. \"Sure. We've got to have time to get ready. But right \
now speed is necessary. That's why I tried to phrase the question so \
you'd give me a clear and concise answer for once. I can't afford to \
spend weeks figuring out what you meant.\"";