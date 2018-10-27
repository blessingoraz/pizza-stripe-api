# pizza-stripe-api
A simple pizza API that is implemented with stripe and mailgun

You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager: 

## Users
| HTTP METHOD             | POST             | GET                    | PUT                      | DELETE                   |
| ----------------------- | ---------------- | ---------------------- | ------------------------ | ------------------------ |
| CRUD                    | CREATE           | READ                   | UPDATE                   | DELETE                   |
| `/users`                | Create new users | List all users         | Error                    | Error                    |
| `/users/:id`            | Error            | Get user if it exists  | Update user if it exists | Error                    |
| `/users/:id?admin=true` | Error            | et user if it exists   | Update user if it exists | Delete user if it exists |

#### Data Params

- name, email, street, address


#### Success Responses:

- Code: 200, 201
- Content: `{ name : "Desmond", email : "desmond@gmail.com", street: 23, address: "Lagos"  }`


#### Error Responses:

- code: 400, 500
- Content: `{ error : "User doesn't exist" }`


## Tokens

| HTTP METHOD             | POST             | GET                    | PUT                      | DELETE                   |
| ----------------------- | ---------------- | ---------------------- | ------------------------ | ------------------------ |
| CRUD                    | CREATE           | READ                   | UPDATE                   | DELETE                   |
| `/token`                | Create new tokens | List all tokens         | Error                    | Error                    |
| `/token/:id`            | Error            | Get token if it exists  | Error                   | Error                    |
| `/token/:id?admin=true` | Error           | Get token if it exists  | Update token if it exists | Delete token if it exists |

#### Data Params

- password, email, street, address


#### Success Responses:

- Code: 200, 201
- Content: `{ userId : "34544", passowrd : "********" }`


#### Error Responses:

- Code: 400, 500
- Content: `{ error : "Token can't be created" }`


## Menu Items

| HTTP METHOD             | POST             | GET                    | PUT                      | DELETE                   |
| ----------------------- | ---------------- | ---------------------- | ------------------------ | ------------------------ |
| CRUD                    | CREATE           | READ                   | UPDATE                   | DELETE                   |
| `/menuItem?admin=true`   | Create new menuItem | List all menuItem   | Error                    | Error               |
| `/menuItem/:id?admin=true` | Error     | Get token if it exists  | Update token if it exists | Delete token if it exists |

#### Data Params

- menu name


#### Success Responses:

- Code: 200, 201
- Content: `{ menu : "" }`


#### Error Responses:

- Code: 400, 500
- Content: `{ error : "Menu can't be created" }`


## Orders

| HTTP METHOD             | POST             | GET              | PUT          | DELETE        |
| ----------------------- | ---------------- | ---------------- | ------------ | --------------|
| CRUD                    | CREATE           | READ             | UPDATE       | DELETE        |
| `/order`                | Create new order | Error            | Error        | Error         |
| `/order?user=id` | Error        | Get list of orders by user  | Error        | Error |

#### Success Responses:

- Code: 200, 201
- Content: `{ user : {}, orders: [] }`


#### Error Responses:

- code: 400, 500
- Content: `{ error : "Menu can't be created" }`



