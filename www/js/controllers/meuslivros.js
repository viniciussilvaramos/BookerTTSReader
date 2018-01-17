angular.module('controllers.MeusLivros',[])
.controller('MeusLivrosCtrl',function ($scope, MeusLivros, $ionicLoading) {
    $scope.$on('$ionicView.enter', function() {
        
        $ionicLoading.show({
            template: 'Aguarde...'
        });        
        
        MeusLivros.encontre()
        .then(function (items) {
            $scope.items = items;
        },function(err){
            alert(err);
        }).finally(function(){
            $ionicLoading.hide();
        })
    });

	$scope.abrirItem = function (item) {
		MeusLivros.salvarLeituraRecente(item)
		.then(function (result) {
            $state.go('tab.conteudoLivro', {tituloLivro: item.Titulo});
		},function(err){
            alert(err);
        })
	}
})