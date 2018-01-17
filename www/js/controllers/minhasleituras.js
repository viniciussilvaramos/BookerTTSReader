angular.module('controllers.MinhasLeituras', [])

.controller('MinhasLeiturasCtrl', function ($scope, MeusLivros, $ionicLoading) {
    
    $scope.$on('$ionicView.enter', function() {
        $ionicLoading.show({
            template: 'Aguarde...'
        });
        
        MeusLivros.obterRecentementeLidos()
        .then(function (livros) {
            $scope.livros = livros;    	
        },function(err){
            alert(err);
        }).finally(function(){
            $ionicLoading.hide(); 
        });        
    });
    
})

