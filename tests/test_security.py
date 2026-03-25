from http import HTTPStatus

import pytest
from jwt import (
    DecodeError,
    ExpiredSignatureError,
    InvalidSignatureError,
    decode,
)

from fastapi_zero import security
from fastapi_zero.security import ALGORITHM, SECRET_KEY, create_access_token


def test_jwt_should_encode_and_decode_token():

    data = {'test': 'test_value'}

    token = create_access_token(data)

    decoded_data = decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    assert decoded_data['test'] == data['test']
    assert 'exp' in decoded_data


def test_jwt_should_invalid_token(client):

    response = client.delete(
        '/users/1', headers={'Authorization': 'Bearer invalidtoken'}
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Could not validate credentials'}


def test_jwt_should_expire_token(monkeypatch):

    data = {'test': 'test_value'}
    monkeypatch.setattr(security, 'ACCESS_TOKEN_EXPIRE_MINUTES', -1)

    token = create_access_token(data)

    with pytest.raises(ExpiredSignatureError):
        decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def test_jwt_should_raise_decode_error_for_invalid_token():
    invalid_token = 'invalidtoken'

    with pytest.raises(DecodeError):
        decode(invalid_token, SECRET_KEY, algorithms=[ALGORITHM])


def test_jwt_should_raise_decode_error_for_tampered_token():
    data = {'test': 'test_value'}

    token = create_access_token(data)

    # Tamper with the token by changing one character
    tampered_token = token[:-1] + ('a' if token[-1] != 'a' else 'b')

    with pytest.raises(InvalidSignatureError):
        decode(tampered_token, SECRET_KEY, algorithms=[ALGORITHM])
