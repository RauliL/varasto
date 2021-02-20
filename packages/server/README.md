# Varasto

Varasto is a minimalistic key-value store that can store any kind of JSON
object identified by a key. Values are persisted on disk.

Varasto comes with an HTTP interface, allowing you to store, retrieve and
remove items from it.

## Installation

```bash
$ npm install -g varasto
```

## Usage

```bash
$ varasto [-p port] <directory>
```

Port which the HTTP server will be responding from can be specified with the
`-p` flag. By default Varasto will use port `3000`.

The directory where items are stored is specified with `<directory>` command
line argument. If the directory does not exist, it will be created once items
are being stored.

Once the HTTP server is up and running, you can use HTTP methods `GET`, `POST`
and `DELETE` to retrieve, store and remove items from the store.

### Storing items

For example, to store an item, you can use a `POST` request like this:

```http
POST /foo HTTP/1.0
Content-Type: application/json
Content-Length: 14

{"foo": "bar"}
```

Or you can use [curl](https://curl.haxx.se) to store an item like this:

```bash
$ curl -X POST \
    -H 'Content-Type: application/json' \
    -d '{"foo": "bar"}' \
    http://localhost:3000/foo
```

The identifier of the stored item in that example would be `foo`. It's defined
by the path to which the request is being made and can contain any character
except slash (`/`).

### Retrieving items

To retrieve a previously stored item, you make an `GET` request, where the
request path again acts as the identifier of the item.

```http
GET /foo HTTP/1.0
```

To which the HTTP server will respond with the JSON object previously stored
with identifier `foo`. If an item with given identifier does not exist, HTTP
error 404 will be returned instead.

### Removing items

To remove an previously stored item, you make a `DELETE` request, with the
request path again acting as the identifier of the item you wish to remove.

```http
DELETE /foo HTTP/1.0
```

If item with identifier `foo` exists, it's value will be returned as response.
If an item with the given identifier does not exist, HTTP error 404 will be
returned instead.

### Updating items

You can also partially update an already existing item with `PATCH` request.
The JSON sent with an `PATCH` request will be shallowly merged with the already
existing data and the result will be sent as response.

For example, you have an item `person` with the following data:

```JSON
{
    "name": "John Doe",
    "address": "Some street 4",
    "phoneNumber": "+35840123123"
}
```

And you send an `PATCH` request like this:

```http
PATCH /person HTTP/1.0
Content-Type: application/json
Content-Length: 71

{
    "address": "Some other street 5",
    "faxNumber": "+358000000"
}
```

You end up with:

```JSON
{
    "name": "John Doe",
    "address": "Some other street 5",
    "phoneNumber": "+35840123123",
    "faxNumber": "+358000000"
}
```

## Notes

Varasto does not currently support any kind of authentication, so you might not
want to expose it to public network.
