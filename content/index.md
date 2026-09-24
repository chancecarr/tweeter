# Tweeter

[< Back Home](/..)

###### [See the code](https://github.com/chancecarr/tweeter)

### Explanation

Tweeter was a project I did for my software design class (CS 340) at BYU. I took a pre-built site that was raw HTML and refactored it to utilize React and AWS-based cloud architecture. I also refactored a lot of the previous design to get rid of hundreds of lines (or more) of code duplication through utilizing inheritance and software design patterns.

By the end of the course, my Twitter-like site was scaled to support users with over **10,000** followers. I used utilizing AWS queues to ensure that all posts would be delivered no matter the size of a user's follow-count and with minimial latency.

###### The patterns I learned and practiced:

- Observer
- Model-View-Controller / Model-View-Presenter
- Proxy
- Facade
- Template Method
- Strategy
- DAO / DTO
- Factory
- Abstract Factory
- Adapter
- Decorator
- State
- Command

###### The AWS tools I learned and utilized:

- AWS Console, CLI, SDK
- IAM (Identity and Access Management)
- Lambda
- API Gateway
- DynamoDB
- SQS (Simple Queue Service)