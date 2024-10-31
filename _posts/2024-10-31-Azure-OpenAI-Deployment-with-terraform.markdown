---
layout: post
title:  Azure OpenAI Deployment types with Terraform
description: We'll explore the essential topics from Azure OpenAI Service and use Terraform code examples to help implement these concepts effectively.
date: 2024-10-31 12:00:00 +0300
image: '/images/azurexopenai.png'
ShowToc: true
tags: [Azure, OpenAI, AI, Terraform]
---
Hey everyone, the Azure OpenAI Service offers a powerful platform where you can embed advanced AI capabilities into applications. Understanding various deployment types and implications on resiliency, availability, and performance is, therefore, crucial. In this blog post, we dive deep into the relevant topics and do not miss offering Terraform code examples for the shown approaches.

## Stateless Nature of the Generative API
When working with generative models using Azure OpenAI, it is very important to consider that these models are stateless. Each call to the API is distinct and the model does not retain any session or history of conversation.
* **System Prompt**: This is what defines the behavior of the assistant.
* **User Prompt**: What the user types.
* **Assistant's response**: This is the model's generated output.

Take, for example keeping up a conversation. In every call your application makes to the API, it needs to be provided with the whole conversation history.

### Implications
* **Scalability**: Requests can be routed to any instance without concern about state.
* **Resiliency**: Instances can be scaled up or down, replaced or rerouted without effecting the conversation flow.

## Regional Azure OpenAI Resource
When you create an Azure OpenAI resource, it is bound to one Azure region; for example East US and West Europe. This implies:
* The Service endpoint that you interact with is regional.
* **Data Residency**: Data is processed and stored within that region.

### Terraform example
``` js
resource "azurerm_resource_group" "rg" {
  name     = "ai-rg"
  location = "eastus2"
}

resource "azurerm_cognitive_account" "ai_ca" {
  name                = "ai-ca"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
}

```

## How Capacity Pools Work
In each region, there are pools of capacity running specific models and versions. Capacity pools are groups of instances running on GPUs serving the inference workloads.
* **Autoscaling**: he capacity pool can scale in or out.
* **Multiple Instances**: Ensures high availability and load balancing.

### Key Points
* **No Ongoing State**: Each instance will serve te request independently.
* **Control Plane and Data Plane**: The control plane is responsible for staling and health, while the data plance is responsible for inference requests.

## Responseble AI Layers
Azure OpenAI provides Responsible AI layers to ensure compliance and prevent abuse.
* **Content Filtering**: Prompts and responses are scanned for policy violations.
* **Regional Availability**: A Responsible AI layer is available in each region.

## Model Deployment Types
When you deploy a model, you have choises about where your interface requests can be processed.

### Standard Deployment
* **Regional Scope**: Requests are processed only withing the capacity pool of that region in which your resource is deployed.
* **Limited Capacity**: You're limited to the instances available within that region.

### Global Deployment
* **Global Scope**: Requests can be routed to any capacity pool globally, which supports your model and version.
* **Higher Availability**: Be able to process the request more quickly.

### Data Zone Deployment
* **Zone Scope**: Requests are processed in defined data zones, such as <span class="highlight">West US 2</span> or <span class="highlight">West Europe</span> (For more informations about models by deployment type and regions, access the [Azure OpenAI Service models](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=python-secure%2Cglobal-standard%2Cstandard-chat-completions) page).
* **Data Residency compliance**: Ensures that data resides within the boundaries of geographical localtions.

### Terraform Example

``` js
resource "azurerm_cognitive_deployment" "ai_cd" {
  name                 = "ai-opeinai-cd"
  cognitive_account_id = azurerm_cognitive_account.ai_ca.id
  model {
    format  = "OpenAI"
    name    = "gpt-4o-realtime-preview"
    version = "2024-10-01"
  }

  sku {
    name = "GlobalStandard"
  }
}
```

## Intelligent Rounting
The Azure OpenAI uses intelligent rounting to make sure optmization arount performance is achieved:
* **Least Busy Instance**: Routest to the isntance that is least busy.
* **Global Optmization**: It takes into consideration all available pools of capacity for global deployments.
* **Latency Considerations**: It optimizaes overall response time instead of network latency.

## Network vs. Inference Latency
* **Network Latency**: The time it takes from the request to reach the server back to returning the response.
  * Generally very low, such as 10-20 milliseconds.
* **Inference Latency**: Time take by the model to return a response
  * Greater than network latency

### Implications
* **Optimization of inference latency**: Performance optimization more important with respect to inference latency.
* **Global Deployment**: Access to less utilized instnaces reduces the inference latency.

## Quota vs Available Capacity
* **Quota**: Maximum tokens per minute allowed for the resource
* **Available Capacity**: Resources that are available at any time.

### Challenges
* **Quota doesn't guarantee capacity**: You mightn't be able to fulfill your quota capacity isn't available.
* **Regional Limitations**: Capacity can become an issue with standard deployments.

### Solution
* **Global or Data Zone Deployments**: Expand your pool of availability to meet your quota.

## Data Zones and Data Resiliency
Data Zones let you balance between being globally available and, at the same time, needs to satisfy data residency requirements.
* **US Data Zone**: Data processing will only be done within US regions
* **EU Data Zone**: Data processing will only be processed within EU regions
### Use Cases
* **Compliance**: Meet regulatory requirements about data residency, that is where data is processed.
* **Performance**: Can still take advantage of a larger resource pool inside the data zone

## Increase Application Resiliency
Even with deployments being global, or at least at the level of the data zone, your Azure OpenAI resource is still a single point of failure within its region.

### Approaches
* **Multiple Regional Resources**: It sets up the configuration for deploying Azure OpenAI resource accross more than one region.
* **Failover Mechanism**: It describes the logic required to trigger endpoint switching in case of failure.