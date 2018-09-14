### Start application

For staging

```
NODE_ENV=staging node bin/www
```

For production

```
NODE_ENV=production node bin/www
```

### CLI manual

 - man: Show help
 - exit: Stop this CLI and the pizza delivery app
 - menu: View all current menu items
 - recent orders: View all the recent orders in the system (orders placed in the last 24 hours)
 - order detail --{orderId}: Lookup the details of a specific order by order ID
 - users: View all the users who have signed up in the last 24 hours
 - user --{email}: Lookup the details of a specific user by email address



### Public endpoints

1. User sign up

    ```
    curl -X POST \
      http://localhost:3000/sign-up \
      -H 'Content-Type: application/json' \
      -d '{
        "email": "pizza.user@gmail.com",
        "password": "password",
        "firstName": "Pizza",
        "lastName": "User"
    }'
    ```

    Response:

    ```
    {
        "email": "pizza.user@gmail.com",
        "firstName": "Pizza",
        "lastName": "User",
        "token": "2ewez0rkizwpuyguwf1"
    }
    ```

2. User sign in

    ```
    curl -X POST \
      http://localhost:3000/sign-in \
      -H 'Content-Type: application/json' \
      -d '{
    	"email": "pizza.user@gmail.com",
    	"password": "password"
    }'
    ```

### Authorized endpoints

1. Get user info
    ```
    curl -X GET \
      http://localhost:3000/me \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16'
    ```

    Response:

    ```
    {
        "email": "pizza.user@gmail.com",
        "firstName": "Pizza",
        "lastName": "User"
    }
    ```

2. Update user info
    ```
    curl -X PUT \
      http://localhost:3000/me \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16' \
      -d '{
    	"address": "Address 1",
    	"lastName": "Lastname",
    	"firstName": "Firstname"
    }'
    ```

    Response:

    ```
    {
        "email": "pizza.user@gmail.com",
        "firstName": "Firstname",
        "lastName": "Lastname",
        "address": "Address 1"
    }
    ```

### Pizza

1. GET /pizzas

    ```
    curl -X GET \
      http://localhost:3000/pizzas \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16'
    ```

    Response:

    ```
    [
        {
            "name": "Pizza 4 [updated]",
            "description": "Pizza 4 Description",
            "id": "ba65z6t0hzr9jf19f8k",
            "price": 1000
        },
        {
            "name": "Pizza 3",
            "description": "Pizza 3 Description",
            "id": "ktqoc4pvmgufwgloped",
            "price": 2000
        },
        {
            "name": "Pizza 1",
            "description": "Pizza 1 Description",
            "id": "remeousoe6v2yjsm1ae",
            "price": 500
        },
        {
            "name": "Pizza 2",
            "description": "Pizza 2 Description",
            "id": "ve8mm2ib8pvpagj9rcx",
            "price": 3000
        }
    ]
    ```

2. Add a new pizza. POST /pizzas. Only admin can use this route

    ```
    curl -X POST \
      http://localhost:3000/pizzas \
      -H 'Content-Type: application/json' \
      -H 'token: pvsl956fjiijdqij4wv' \
      -d '{
    	"price": 3000,
    	"name": "Pizza 5",
    	"description": "Pizza 5 description"
    }'
    ```

    Response:

    ```
    {
        "price": 3000,
        "name": "Pizza 5",
        "description": "Pizza 5 description",
        "id": "txvyuq2evsrle1bw0jc"
    }
    ```

3. Update pizza by id. PUT /pizzas. Only admin can use this route

    ```
    curl -X PUT \
      http://localhost:3000/pizzas \
      -H 'Content-Type: application/json' \
      -H 'token: pvsl956fjiijdqij4wv' \
      -d '{
    	"price": 5000,
    	"id": "txvyuq2evsrle1bw0jc"
    }'
    ```

    Response:

    ```
    {
        "price": 5000,
        "name": "Pizza 5",
        "description": "Pizza 5 description",
        "id": "txvyuq2evsrle1bw0jc"
    }
    ```

4. Delete a pizza. DELETE /pizzas. Only admin

    ```
    curl -X DELETE \
      'http://localhost:3000/pizzas?id=txvyuq2evsrle1bw0jc' \
      -H 'Content-Type: application/json' \
      -H 'token: pvsl956fjiijdqij4wv' \
      -d '{
    	"price": 5000,
    	"id": "txvyuq2evsrle1bw0jc"
    }'
    ```

    Response:

    ```
    {
        "message": "The record has been deleted"
    }
    ```

### Users

1. Get the list of users GET /users. Only admin

    ```
    curl -X GET \
      http://localhost:3000/users \
      -H 'Content-Type: application/json' \
      -H 'token: pvsl956fjiijdqij4wv'
    ```

2. Add a new user. POST /users. Only admin

    ```
    curl -X POST \
      http://localhost:3000/users \
      -H 'Content-Type: application/json' \
      -H 'token: pvsl956fjiijdqij4wv' \
      -d '{
    	"email": "email@email.com",
    	"password": "password",
    	"firstName": "f",
    	"lastName": "l"
    }'
    ```
3. Update a user. PUT /users. Only admin
4. Delete a user. DELETE /users. Only admiin

### Carts

1. Get the cart items GET /carts.

    ```
    curl -X GET \
      'http://localhost:3000/carts?id=ba65z6t0hzr9jf19f8k' \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16'
    ```

    Response:

    ```
    [
        {
            "name": "Pizza 4 [updated]",
            "description": "Pizza 4 Description",
            "id": "ba65z6t0hzr9jf19f8k",
            "price": 1000,
            "count": 2
        }
    ]
    ```

2. Add an item to the cart. POST /carts.

    ```
    curl -X POST \
      http://localhost:3000/carts \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16' \
      -d '{
    	"id": "ba65z6t0hzr9jf19f8k",
    	"count": 1
    }'
    ```

    Response:

    ```
    [
        {
            "name": "Pizza 4 [updated]",
            "description": "Pizza 4 Description",
            "id": "ba65z6t0hzr9jf19f8k",
            "price": 1000,
            "count": 1
        }
    ]
    ```

3. Update the cart item PUT /carts

    ```
    curl -X PUT \
      http://localhost:3000/carts \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16' \
      -d '{
    	"id": "ba65z6t0hzr9jf19f8k",
    	"count": 2
    }'
    ```

    Response:

    ```
    [
        {
            "name": "Pizza 4 [updated]",
            "description": "Pizza 4 Description",
            "id": "ba65z6t0hzr9jf19f8k",
            "price": 1000,
            "count": 2
        }
    ]
    ```

4. Delete the cart item DELETE /carts

    ```
    curl -X DELETE \
      'http://localhost:3000/carts?id=ba65z6t0hzr9jf19f8k' \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16' \
      -d '{
    	"id": "ba65z6t0hzr9jf19f8k",
    	"count": 2
    }'
    ```

    Response:

    ```
    {
        "message": "The record has been deleted"
    }
    ```

### Orders

1. Create an order POST /orders
    ```
    curl -X POST \
      http://localhost:3000/orders \
      -H 'Cache-Control: no-cache' \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16'
    ```

    Response:

    ```
    {
        "status": "created",
        "userId": "pizza.user@gmail.com",
        "items": [
            {
                "id": "ba65z6t0hzr9jf19f8k",
                "count": 2,
                "price": 1000
            }
        ],
        "id": "qsazx0fh3p00ch8gi33"
    }
    ```

2. Pay the order using its id PUT /orders/pay

    ```
    curl -X PUT \
      http://localhost:3000/orders/pay \
      -H 'Content-Type: application/json' \
      -H 'token: 3oahbt5xxkih1vqvw16' \
      -d '{
    	"id": "qsazx0fh3p00ch8gi33",
    	"source": "tok_visa"
    }'
    ```

    Response:

    ```
    {
        "status": "paid",
        "userId": "pizza.user@gmail.com",
        "items": [
            {
                "id": "ba65z6t0hzr9jf19f8k",
                "count": 2,
                "price": 1000
            }
        ],
        "id": "qsazx0fh3p00ch8gi33",
        "stripeId": "ch_1D8oSmKIJMYDyAPV720vn5zJ"
    }
    ```
