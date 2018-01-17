angular.module('starter', ['ionic', 'controllers.ConteudoLivro','controllers.MeusLivros','controllers.MinhasLeituras', 'services.livros','controllers.ConteudoLivroPdf'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  
  $stateProvider
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('tab.meusLivros', {
    url: '/meusLivros',
    views: {
      'tab-meusLivros': {
        templateUrl: 'templates/tab-minhasleituras.html',
        controller: 'MinhasLeiturasCtrl'
      }
    }
  })  
  .state('tab.todosLivros',{
    url:'/todosLivros',
    views:{
      'tab-todosLivros':{
        templateUrl: 'templates/tab-meuslivros.html',
        controller: 'MeusLivrosCtrl'
      }
    }
  })
  .state('tab.conteudoLivroLeitura', {
    url: '/conteudolivro/:tituloLivro',
    views:{
      'tab-meusLivros':{
        templateUrl: 'templates/conteudolivro.html',
        controller: 'ConteudoLivroCtrl'
      }
    }
  })
  .state('tab.conteudoLivroTodos', {
    url: '/conteudolivro/:tituloLivro',
    views:{
      'tab-todosLivros':{
        templateUrl: 'templates/conteudolivro.html',
        controller: 'ConteudoLivroCtrl'
      }
    }
  })
  .state('tab.conteudoLivroPdfTodos', {
    url: '/conteudolivropdf/:tituloLivro',
    views:{
      'tab-todosLivros':{
        templateUrl: 'templates/conteudolivropdf.html',
        controller: 'ConteudoLivroPdfCtrl'
      }
    }
  })
  .state('tab.conteudoLivroPdfLeitura', {
    url: '/conteudolivropdf/:tituloLivro',
    views:{
      'tab-meusLivros':{
        templateUrl: 'templates/conteudolivropdf.html',
        controller: 'ConteudoLivroPdfCtrl'
      }
    }
  })

  $urlRouterProvider.otherwise('/tab/meusLivros');
});
