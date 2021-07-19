import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'SessionsController.index');
Route.post('/login', 'SessionsController.login');
Route.get('/logout', 'SessionsController.logout');

Route.post('/upload','CommandsController.upload');
Route.post('/execute','CommandsController.execCommand');