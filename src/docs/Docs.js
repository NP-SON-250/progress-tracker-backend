import express from "express";
import { serve, setup } from "swagger-ui-express";

const docrouter = express.Router();

const options = {
  openapi: "3.0.1",
  info: {
    title: "PTC API",
    version: "1.0.0",
    description: "Documentation for PTC API.",
  },
  basePath: "/",
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Users",
      description: "Operations related to Users entities",
    },
    {
      name: "Exams",
      description: "Operations related to Exams entities",
    },
    {
      name: "Questions",
      description: "Operations related to Questions entities",
    },
    {
      name: "Options",
      description: "Operations related to Options entities",
    },
    {
      name: "Accounts",
      description: "Operations related to Accounts entities",
    },
    {
      name: "Purchases",
      description: "Operations related to Purchases entities",
    },
    {
      name: "Waitting Exams",
      description: "Operations related to Waitting Exams entities",
    },
    {
      name: "Unpaid Exams",
      description: "Operations related to Unpaid Exams entities",
    },
    {
      name: "Passed Exams",
      description: "Operations related to Passed Exams entities",
    },
    {
      name: "Failled Exams",
      description: "Operations related to Failled Exams entities",
    },
    {
      name: "Expired Exams",
      description: "Operations related to Expired Exams entities",
    },
    {
      name: "Total User Exams",
      description: "Operations related to Total User Exams entities",
    },
    {
      name: "Waittiing Accounts",
      description: "Operations related to Waittiing Accounts entities",
    },
    {
      name: "Unpaid Accounts",
      description: "Operations related to Unpaid Accounts entities",
    },
    {
      name: "Expired Accounts",
      description: "Operations related to Expired Accounts entities",
    },
    {
      name: "Total User Accounts",
      description: "Operations related to Total User Accounts entities",
    },
    {
      name: "Responses",
      description: "Operations related to Total Responses entities",
    },
  ],
  paths: {
    //User login
    "/api/v1/users/auth": {
      post: {
        tags: ["Users"],
        summary: "User Login",
        description: "User login using a single field for phone or email",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  identifier: {
                    type: "string",
                    description: "Phone number or email",
                  },
                  password: {
                    type: "string",
                  },
                },
                required: ["identifier", "password"],
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "You logged in successfully",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/users/auth/school": {
      post: {
        tags: ["Users"],
        summary: "User Login",
        description:
          "User login using a single field for tin number or company name",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  identifier: {
                    type: "string",
                    description: "Tin number or company name",
                  },
                  password: {
                    type: "string",
                  },
                },
                required: ["identifier", "password"],
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "You logged in successfully",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },

    "/api/v1/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Read User By ID",
        description: "Get a user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User retrieved",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        description: "Update an existing user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  fName: {
                    type: "string",
                  },
                  lName: {
                    type: "string",
                  },
                  idCard: {
                    type: "string",
                  },
                  address: {
                    type: "string",
                  },
                  phone: {
                    type: "string",
                  },
                  email: {
                    type: "string",
                  },
                  password: {
                    type: "string",
                  },
                  companyName: {
                    type: "string",
                  },
                  tin: {
                    type: "string",
                  },
                  profile: {
                    type: "string",
                    format: "binary",
                  },
                  role: {
                    type: "string",
                    enum: ["student", "admin", "school", "supperAdmin"],
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "User updated",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Delete a user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Users deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/users": {
      post: {
        tags: ["Users"],
        summary: "Create user",
        description: "Create new user",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  fName: {
                    type: "string",
                  },
                  lName: {
                    type: "string",
                  },
                  idCard: {
                    type: "string",
                  },
                  address: {
                    type: "string",
                  },
                  phone: {
                    type: "string",
                  },
                  email: {
                    type: "string",
                  },
                  password: {
                    type: "string",
                  },
                  companyName: {
                    type: "string",
                  },
                  tin: {
                    type: "string",
                  },
                  profile: {
                    type: "string",
                    format: "binary",
                  },
                  role: {
                    type: "string",
                    enum: ["student", "admin", "school", "supperAdmin"],
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          201: {
            description: "New user added",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      get: {
        tags: ["Users"],
        summary: "All users",
        description: "Get all users",
        responses: {
          200: {
            description: "All users are retrieved",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Exams actions
    "/api/v1/exams/{id}": {
      get: {
        tags: ["Exams"],
        summary: "Read exam By id",
        description: "Get an exam by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Exam retrieved",
          },
          404: {
            description: "Exam not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      put: {
        tags: ["Exams"],
        summary: "Update exam",
        description: "Update an existing exam",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  type: {
                    type: "string",
                  },
                  number: {
                    type: "string",
                  },
                  fees: {
                    type: "string",
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "Exam updated",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Exam not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      delete: {
        tags: ["Exams"],
        summary: "Delete exam",
        description: "Delete an exam",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Exam deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Exam not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/exams/kora/{number}": {
      get: {
        tags: ["Exams"],
        summary: "Read kora exam By number",
        description: "Get kora exam by number",
        parameters: [
          {
            name: "number",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Exam retrieved",
          },
          404: {
            description: "Exam not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/exams": {
      get: {
        tags: ["Exams"],
        summary: "All exams",
        description: "Get all exams",
        responses: {
          200: {
            description: "All exams are retrieved",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      post: {
        tags: ["Exams"],
        summary: "Create exam",
        description: "Create new exam",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  type: {
                    type: "string",
                  },
                  number: {
                    type: "string",
                  },
                  fees: {
                    type: "string",
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          201: {
            description: "New exam added",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Questions actions
    "/api/v1/questions/{id}": {
      put: {
        tags: ["Questions"],
        summary: "Update questions",
        description: "Update an existing question",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  phrase: {
                    type: "string",
                  },
                  marks: {
                    type: "number",
                  },
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "Question updated",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Question not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      delete: {
        tags: ["Questions"],
        summary: "Delete question",
        description: "Delete a question",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Question deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Question not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/questions/{exam}": {
      post: {
        tags: ["Questions"],
        summary: "Create question",
        description: "Create new question",
        parameters: [
          {
            name: "exam",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  phrase: {
                    type: "string",
                  },
                  marks: {
                    type: "number",
                  },
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          201: {
            description: "New question added",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      get: {
        tags: ["Questions"],
        summary: "Read questions by exam id",
        description: "Get questions by exam",
        parameters: [
          {
            name: "exam",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Exam's questions retrieved",
          },
          404: {
            description: "No question found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/questions/single/{id}": {
      get: {
        tags: ["Questions"],
        summary: "Read question by id",
        description: "Get a question by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Question retrieved",
          },
          404: {
            description: "Question not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Options actions
    "/api/v1/options/{id}": {
      post: {
        tags: ["Options"],
        summary: "Create option",
        description: "Create new option",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                  },
                  isCorrect: {
                    type: "boolean",
                    enum: ["true", "false"],
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          201: {
            description: "New option added",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      put: {
        tags: ["Options"],
        summary: "Update option",
        description: "Update an existing option",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                  },
                  isCorrect: {
                    type: "boolean",
                    enum: ["true", "false"],
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "Option updated",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Option not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      delete: {
        tags: ["Options"],
        summary: "Delete option",
        description: "Delete an option",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Option deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Option not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/options/{question}": {
      get: {
        tags: ["Options"],
        summary: "Read option by question id",
        description: "Get option by question",
        parameters: [
          {
            name: "question",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Question's options retrieved",
          },
          404: {
            description: "No options found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/options/single/{id}": {
      get: {
        tags: ["Options"],
        summary: "Read option by id",
        description: "Get a option by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Option retrieved",
          },
          404: {
            description: "Option not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Responses actions
    "/api/v1/responses/add": {
      post: {
        tags: ["Responses"],
        summary: "Respond to exam",
        description: "Submit selected options for questions in an exam",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  examId: {
                    type: "string",
                    description: "The ID of the exam being responded to",
                  },
                  responses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        questionId: {
                          type: "string",
                        },
                        selectedOptionId: {
                          type: "string",
                        },
                      },
                      required: ["questionId", "selectedOptionId"],
                    },
                  },
                },
                required: ["examId", "responses"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Response added",
          },
          400: {
            description: "Bad request",
          },
          404: {
            description: "Exam not found",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    "/api/v1/responses/user": {
      get: {
        tags: ["Responses"],
        summary: "Current responses",
        description: "Get all current responses",
        responses: {
          200: {
            description: "All responses are retrieved",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/responses/supper{id}": {
      delete: {
        tags: ["Responses"],
        summary: "Delete response",
        description: "Delete an account",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Reponse deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Accounts actions
    "/api/v1/accounts/{id}": {
      get: {
        tags: ["Accounts"],
        summary: "Read account by id",
        description: "Get an account by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Account retrieved",
          },
          404: {
            description: "Account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      put: {
        tags: ["Accounts"],
        summary: "Update account",
        description: "Update an existing account",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  fees: {
                    type: "string",
                  },
                  validIn: {
                    type: "string",
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "Account updated",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      delete: {
        tags: ["Accounts"],
        summary: "Delete account",
        description: "Delete an account",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Account deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/accounts": {
      get: {
        tags: ["Accounts"],
        summary: "All account",
        description: "Get all account",
        responses: {
          200: {
            description: "All accounts are retrieved",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      post: {
        tags: ["Accounts"],
        summary: "Create account",
        description: "Create new account",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  fees: {
                    type: "string",
                  },
                  validIn: {
                    type: "string",
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          201: {
            description: "New account added",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Purchases actions
    "/api/v1/purchases/{itemId}": {
      post: {
        tags: ["Purchases"],
        summary: "Create purchase",
        description: "Create new purchase",
        parameters: [
          {
            name: "itemId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          201: {
            description: "New purchase added",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/paid/{itemId}": {
      post: {
        tags: ["Purchases"],
        summary: "Create purchase and payment",
        description: "Create new purchase and payment",
        parameters: [
          {
            name: "itemId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          201: {
            description: "New purchase and payment recorded",
          },
          400: {
            description: "Bad Request",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/complete": {
      get: {
        tags: ["Purchases"],
        summary: "Read completed your purchases",
        description: "Get all your completed payments",
        responses: {
          200: {
            description: "Complete purchases retrieved",
          },
          404: {
            description: "No completed found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/all": {
      get: {
        tags: ["Purchases"],
        summary: "Read your pending purchases",
        description: "Get all your pending payments",
        responses: {
          200: {
            description: "Pending purchases retrieved",
          },
          404: {
            description: "No pending found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/access/{code}": {
      get: {
        tags: ["Purchases"],
        summary: "Read exam by access code",
        description: "Get exam by its access code",
        parameters: [
          {
            name: "code",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Ikiza cya code yawe ni iki",
          },
          404: {
            description: "Ntakizamini kibonetse kuri iyi code",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/": {
      get: {
        tags: ["Purchases"],
        summary: "Read admin purchases",
        description: "Get all admin purchase",
        responses: {
          200: {
            description: "Admin purchases retrieved",
          },
          404: {
            description: "No admin purchases found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/{purchaseId}": {
      get: {
        tags: ["Purchases"],
        summary: "Read purchase by id",
        description: "Get purchase by",
        parameters: [
          {
            name: "purchaseId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Purchase retrieved",
          },
          404: {
            description: "No purchase found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
      delete: {
        tags: ["Purchases"],
        summary: "Delete purchas",
        description: "Delete a purchas",
        parameters: [
          {
            name: "purchaseId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Purchase deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Purchase not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/access/{accessCode}": {
      delete: {
        tags: ["Purchases"],
        summary: "Delete purchas by accessCode",
        description: "Delete a purchas by accessCode",
        parameters: [
          {
            name: "accessCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Purchase deleted",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Purchase not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },

    "/api/v1/purchases/user": {
      get: {
        tags: ["Purchases"],
        summary: "Read logged user purchase",
        description: "Get logged user purchase",
        responses: {
          200: {
            description: "Logged user purchase retrieved",
          },
          404: {
            description: "No logged user purchase not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/purchases/{id}": {
      put: {
        tags: ["Purchases"],
        summary: "Update payment",
        description: "Update user payment",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["pending", "complete", "expired"],
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "Purchase updated",
          },
          400: {
            description: "Bad Request",
          },
          404: {
            description: "Purchase not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Waitting exams
    "/api/v1/waittingexams/{id}": {
      get: {
        tags: ["Waitting Exams"],
        summary: "Read waitting exam by id",
        description: "Get un paid exam by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Waitting exam retrieved",
          },
          404: {
            description: "wWitting exams not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/waittingexams": {
      get: {
        tags: ["Waitting Exams"],
        summary: "Read waitting exams",
        description: "Get all waitting exams",
        responses: {
          200: {
            description: "Waitting exams retrieved",
          },
          404: {
            description: "No waitting exams found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Un paid exams
    "/api/v1/unpaidexams/{id}": {
      get: {
        tags: ["Unpaid Exams"],
        summary: "Read un paid exam by id",
        description: "Get un paid exam by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Unpaid exam retrieved",
          },
          404: {
            description: "Unpaid exams not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/unpaidexams": {
      get: {
        tags: ["Unpaid Exams"],
        summary: "Read unpaid exams",
        description: "Get all unpaid exams",
        responses: {
          200: {
            description: "Unpaid exams retrieved",
          },
          404: {
            description: "No unpaid exams found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },

    //Passed exams
    "/api/v1/passedexams/{id}": {
      get: {
        tags: ["Passed Exams"],
        summary: "Read un passed exam by id",
        description: "Get un passed exam by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Passed exam retrieved",
          },
          404: {
            description: "Passed exams not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/passedexams": {
      get: {
        tags: ["Passed Exams"],
        summary: "Read passed exams",
        description: "Get all passed exams",
        responses: {
          200: {
            description: "Passed exams retrieved",
          },
          404: {
            description: "No passed exams found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Failled exams
    "/api/v1/failledexams/{id}": {
      get: {
        tags: ["Failled Exams"],
        summary: "Read un failled exam by id",
        description: "Get un failled exam by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Failled exam retrieved",
          },
          404: {
            description: "Failled exams not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/failledexams": {
      get: {
        tags: ["Failled Exams"],
        summary: "Read failled exams",
        description: "Get all failled exams",
        responses: {
          200: {
            description: "Failled exams retrieved",
          },
          404: {
            description: "No failled exams found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Expired exams
    "/api/v1/expiredexams/{id}": {
      get: {
        tags: ["Expired Exams"],
        summary: "Read un expired exam by id",
        description: "Get un expired exam by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Expired exam retrieved",
          },
          404: {
            description: "Expired exams not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/expiredexams": {
      get: {
        tags: ["Expired Exams"],
        summary: "Read expired exams",
        description: "Get all expired exams",
        responses: {
          200: {
            description: "Expired exams retrieved",
          },
          404: {
            description: "No expired exams found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Waitting accounts
    "/api/v1/waittingaccounts/{id}": {
      get: {
        tags: ["Waitting Accounts"],
        summary: "Read Wwitting account by id",
        description: "Get waitting account by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Waitting account retrieved",
          },
          404: {
            description: "Waitting account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/waittingaccounts": {
      get: {
        tags: ["Waitting Accounts"],
        summary: "Read waitting accoints",
        description: "Get all waitting accounts",
        responses: {
          200: {
            description: "Waitting accounts retrieved",
          },
          404: {
            description: "No waitting accounts found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Un paid accounts
    "/api/v1/unpaidaccounts/{id}": {
      get: {
        tags: ["Unpaid Accounts"],
        summary: "Read un paid account by id",
        description: "Get un paid account by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Unpaid account retrieved",
          },
          404: {
            description: "Unpaid account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/unpaidaccounts": {
      get: {
        tags: ["Unpaid Accounts"],
        summary: "Read unpaid accoints",
        description: "Get all unpaid accounts",
        responses: {
          200: {
            description: "Unpaid accounts retrieved",
          },
          404: {
            description: "No unpaid accounts found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Expired accounts
    "/api/v1/expiredaccounts/{id}": {
      get: {
        tags: ["Expired Accounts"],
        summary: "Read un expired account by id",
        description: "Get un expired account by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Expired account retrieved",
          },
          404: {
            description: "Expired account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/expiredaccounts": {
      get: {
        tags: ["Expired Accounts"],
        summary: "Read expired accounts",
        description: "Get all expired accounts",
        responses: {
          200: {
            description: "Expired sccounts retrieved",
          },
          404: {
            description: "No expired accounts found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Total user exams
    "/api/v1/totaluserexams/{id}": {
      get: {
        tags: ["Total User Exams"],
        summary: "Read total user exam by id",
        description: "Get total user exam by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Total user exam retrieved",
          },
          404: {
            description: "Total user exams not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/totaluserexams": {
      get: {
        tags: ["Total User Exams"],
        summary: "Read total user exams",
        description: "Get all total user exams",
        responses: {
          200: {
            description: "Total user exams retrieved",
          },
          404: {
            description: "No total user exams found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    //Total user accounts
    "/api/v1/totaluseraccounts/{id}": {
      get: {
        tags: ["Total User Accounts"],
        summary: "Read total user account by id",
        description: "Get total user account by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Total user account retrieved",
          },
          404: {
            description: "Total user account not found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/v1/totaluseraccounts": {
      get: {
        tags: ["Total User Accounts"],
        summary: "Read total user accoints",
        description: "Get all total user accounts",
        responses: {
          200: {
            description: "Total user accounts retrieved",
          },
          404: {
            description: "No total user accounts found",
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    },
  },
};

docrouter.use("/", serve, setup(options));

export default docrouter;
