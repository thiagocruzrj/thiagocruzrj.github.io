---
layout: post
title:  Azure OpenAI Deployment types with Terraform
description: 
date: 2024-11-01 12:00:00 +0300
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

Take, for example keeping up a conversation. Every call your application makes to the API, it needs to be provided with the whole conversation history.

#### Implications
* **Scalability**: Requests can be routed to any instance without concern about state.
* **Resiliency**: Instances can be scaled up or down, replaced or rerouted without affecting the conversation flow.

## Regional Azure OpenAI Resource
When you create an Azure OpenAI resource, it is bound to one Azure region, for example, East US and West Europe. This implies:
* The <span class="highlight">Service endpoint</span> that you interact with is regional.
* **Data Residency**: Data is processed and stored within that region.

#### Terraform Example
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
In each region, there are capacity pools running specific models and versions. Capacity pools are groups of instances running on GPUs serving the inference workloads.
* **Autoscaling**: he capacity pool can scale in or out.
* **Multiple Instances**: Ensures high availability and load balancing.

#### Key Points
* **No Ongoing State**: Each instance will serve te request independently.
* **Control Plane and Data Plane**: The control plane is responsible for staling and health, while the data plane is responsible for inference requests.

## Responsible AI Layers
Azure OpenAI provides Responsible AI layers to ensure compliance and prevent abuse.
* **Content Filtering**: Prompts and responses are scanned for policy violations.
* **Regional Availability**: A Responsible AI layer is available in each region.

## Model Deployment Types
When you deploy a model, you have choises about where your interface requests can be processed.

#### Standard Deployment
* **Regional Scope**: Requests are processed only within the capacity pool of that region in which your resource is deployed.
* **Limited Capacity**: You're limited to the instances available within that region.

#### Global Deployment
* **Global Scope**: Requests can be routed to any capacity pool globally, which supports your model and version.
* **Higher Availability**: Be able to process the request more quickly.

#### Data Zone Deployment
* **Zone Scope**: Requests are processed in defined data zones, such as <span class="highlight">West US 2</span> or <span class="highlight">West Europe</span> (For more informations about models by deployment type and regions, access the [Azure OpenAI Service models](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=python-secure%2Cglobal-standard%2Cstandard-chat-completions) page).
* **Data Residency compliance**: Ensures that data resides within the boundaries of geographical locations.

#### Terraform Example

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

## Intelligent Routing
The Azure OpenAI uses intelligent rounting to make sure optmization around performance is achieved:
* **Least Busy Instance**: Routest to the instance that is least busy.
* **Global Optmization**: It takes into consideration all available pools of capacity for global deployments.
* **Latency Considerations**: It optimizes overall response time instead of network latency.

## Network vs. Inference Latency
* **Network Latency**: The time it takes from the request to reach the server to the response.
  * Generally very low, such as 10-20 milliseconds.
* **Inference Latency**: Time take by the model to return a response
  * Greater than network latency

#### Implications
* **Optimization of inference latency**: Performance optimization more important with respect to inference latency.
* **Global Deployment**: Access to less utilized instances reduces the inference latency.

## Quota vs Available Capacity
* **Quota**: Maximum tokens per minute allowed for the resource
* **Available Capacity**: Resources that are available at any time.

#### Challenges
* **Quota doesn't guarantee capacity**: You mightn't be able to fulfill your quota if capacity isn't available.
* **Regional Limitations**: Capacity can become an issue with standard deployments.

#### Solution
* **Global or Data Zone Deployments**: Expand your pool of availability to meet your quota.

## Data Zones and Data Resiliency
Data Zones let you balance between being globally available and, at the same time, needs to satisfy data residency requirements.
* **US Data Zone**: Data processing will only be done within US regions
* **EU Data Zone**: Data processing will only be processed within EU regions

#### Use Cases
* **Compliance**: Meet regulatory requirements about data residency, that is where data is processed.
* **Performance**: Can still take advantage of a larger resource pool inside the data zone

## Increase Application Resiliency
Even with deployments being global, or at least at the level of the data zone, your Azure OpenAI resource is still a single point of failure within its region.

#### Approaches
* **Multiple Regional Resources**: It sets up the configuration for deploying Azure OpenAI resource accross more than one region.
* **Failover Mechanism**: It describes the logic required to trigger endpoint switching in case of failure.

## API Management Configuration
With [APIM](https://learn.microsoft.com/en-us/azure/api-management/), you're able to expose an interface endpoint for all your applications.
* **Centralized Routing**: APIM routes the request to a targeted OpenAI resource endpoint.
* **Health Probing**: Automatic detection of failed instances and routing.
* **Policy Implementation**: Caching, rate limiting, and any other policy you want to perform.

``` js
resource "azurerm_virtual_network" "vnet" {
  name                = "ai-opeinai-vnet"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = var.vnet_address_space
  depends_on          = [azurerm_resource_group.rg]
}

resource "azurerm_subnet" "apim_subnet" {
  name                 = "apim-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = [var.apim_subnet_prefix]
}

resource "azurerm_subnet" "cognitive_services_subnet" {
  name                 = "cogsvc-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = [var.cognitive_services_subnet_prefix]
}

resource "azurerm_public_ip" "apim_public_ip" {
  name                = "apim-public-ip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
  domain_name_label   = "apim-oaigw"
}

resource "azurerm_api_management" "apim" {
  name                = "apim"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  publisher_name      = "your-name"
  publisher_email     = "your-email"
  sku_name            = "Premium_1"
  public_ip_address_id = azurerm_public_ip.apim_public_ip.id

  identity {
    type = "SystemAssigned"
  }

  virtual_network_configuration {
    subnet_id = azurerm_subnet.apim_subnet.id
  }

  virtual_network_type = "External"

  lifecycle {
    ignore_changes = [ 
        hostname_configuration
     ]
  } 

  depends_on = [azurerm_subnet.apim_subnet]
}

resource "azurerm_api_management_api" "api" {
  name                  = "openai-api"
  resource_group_name   = azurerm_resource_group.rg.name
  api_management_name   = azurerm_api_management.apim.name
  revision              = "1"
  display_name          = "OpenAI API"
  path                  = ""
  protocols             = ["https"]
  subscription_required = false


  depends_on = [azurerm_api_management.apim]

  import {
    content_format = "openapi-link"
    content_value  = "link"
  }
}

resource "azurerm_api_management_named_value" "tenant_id" {
  name                = "tenant"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name
  display_name        = "tenant"
  value               = data.azurerm_subscription.current.tenant_id
}

resource "azurerm_api_management_api_policy" "policy" {
  api_name            = azurerm_api_management_api.api.name
  api_management_name = azurerm_api_management.apim.name

  depends_on = [azurerm_api_management_api.api, azurerm_api_management_named_value.tenant_id, azurerm_api_management_logger.logger]

  resource_group_name = azurerm_resource_group.rg.name

  xml_content = <<XML
<policies>
</policies>
XML
}
```

## How Prompt Caching Affects Azure OpenAI
Prompt caching in Azure OpenAI reduces the number of tokenizations done to a cached version, hance cost-optimizing it. This is because when a repeated prompt exceeds <span class="highlight">~1,000 tokens</span>, you're able to reuse the result of the tokenization.
* **Instance Level Cache**: The cache is local to the instance serving the requests.
* **Best Effort**: No guarantees; smart routing tries to route similiar requests to the same instance.

## Provisioned Throughput Units (PTUs)
PTUs let you home to Get Capacity Reservations and consequently to achieve consistent performance.

#### Pay-as-You-Go Features
* **Comsumption-Based**: You pay only per your consumption.
* **Variable Costs**: Costs will vary depending on consumption.
* **Not Throughput Guarantees**: Performance depends on available capacity.

#### PTU features
* **Guaranteed Throughput**: Reserves a certain capacity measured in tokens per minute.
* **Consistent Latency**: More predictable response times (99% SLA).
* **Fixed Costs**: You pay for your reserved capacity independend of usage.
  * **Global PTU**: $1/hour.
  * **Data Zone PTU**: $1.10/hour.
* More accessible for smaller workloads.

## Azure Reservations
If you plan to use PTUs over longer timeframes, you can make reservations to reduce costs.
* **Monthly and Yearly Reservations**: Commit to a longer period for discounted rates.
* **Cost Savings**: Save money compared to hourly rates.
* **Planning Required**: Ensure you correctly estimate your capacity needs.

## Batch Service
The Batch deployment type is ideal for those inference jobs that aren't time-sensitive.
* **Asynchronous Processing**: 24-hour asynchronous processing of jobs is allowed.
* **Cost-Effective**: About 50% more cost-effective compared with standard deployments.
* **Global Capacity**: It uses spare capacity globally.

#### Use Cases
* **Content Generation**: Large-scale content generation, where immediate needs aren't there.
* **Data Analysis**: Large amounts of data could be asynchronously processed.

## Summary
Understanding all the deployment options inside Azure OpenAI will be essential to optimal performance, ensuring compliance, and keeping control of your costs. Here is a quick rundown:

* **Stateless API**: Conversation history resides within your application.
* **Regional Resources**: Azure OpenAI resource is regional in scope.
* **Capacity Pools**: The models run on capacity pools that autoscale based on demand.
* **Types of Deployments**:
  * **Standard**: Capacity pools are regional.
  * **Global**: Access to capacity pools globally.
  * **Data Zone**: Access within US or EU regions.
* **Inteligent Rounting**: Optimizes the handling of requests for performance.
* **Provisioned Throughput**: Reserve capacity for guaranteed performance.
* **Improving resiliency**: Using multiple regional resources and API Management.
