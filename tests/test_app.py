from http import HTTPStatus


def test_root_deve_retornar_ola_mundo(client):
    response = client.get('/')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'message': 'Olá Mundo!'}


def test_create_user_deve_criar_usuario(client):

    user_data = {
        'username': 'john_doe',
        'email': 'john_doe@example.com',
        'password': 'securepassword',
    }

    response = client.post('/users', json=user_data)

    assert response.status_code == HTTPStatus.CREATED
    assert response.json() == {
        'id': 1,
        'username': 'john_doe',
        'email': 'john_doe@example.com',
    }


def test_read_users_deve_retornar_lista_de_usuarios(client):
    response = client.get('/users/')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {
        'users': [
            {'id': 1, 'username': 'john_doe', 'email': 'john_doe@example.com'}
        ]
    }


def test_update_user_deve_atualizar_usuario(client):
    updated_user_data = {
        'username': 'john_doe_updated',
        'email': 'john_doe_updated@example.com',
        'password': 'newsecurepassword',
    }

    response = client.put('/users/1', json=updated_user_data)

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {
        'id': 1,
        'username': 'john_doe_updated',
        'email': 'john_doe_updated@example.com',
    }


def test_delete_user_deve_deletar_usuario(client):
    response = client.delete('/users/1')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'message': 'User deleted successfully'}
