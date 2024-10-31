---
layout: post
title:  Demystifying Azure Virtual Networks (VNet)
description: Azure VNet is the easiest way to keep your Azure resources chatting privately. If you want to learn how one of a network's fundamental building blocks works, you're in the right place.
date: 2024-10-08 20:00:00 +0300
image: '/images/virtual-network.jpg'
ShowToc: true
tags: [Azure, Networking, VNet]
---
Hi, fellow cloud enthusiasts, welcome to my first blog post! 👋
If you've ever wondered how to keep your Azure resources chatting privately without being "bothered" by the outside world, follow me in this article. Today, we're diving into the networking world of [Azure Virtual Networks (VNet)](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview). Whether you're a seasoned DevOps engineer or just starting your cloud path, this guide will help you set up your secure and efficient VNet using Terraform.

## What is Azure Virtual Network (VNet)? 

Imagine Azure Virtual Network as your private neighborhood in the vast city of Azure. 🏡 Just like how you have streets, houses, and maybe a coffee shop around the corner, VNet provides a secure and isolated environment where your Azure resources (like Virtual Machines, Databases, etc.) can communicate with each other and the outside worldᅳsafely and efficiently. 

## Why Should You Care? 
- First **security**, keeping your data safer than your most expensive Pokémon card. 
- Improve the **control** managing traffic flow like a traffic cop directing Azure resources. 
- Scale up or down **flexibility** without effort (or your network). 

## Key Components of VNet 
Let's break down the essential parts of a VNet. Think of it as building your own cloud city, block by block.

### Subnets and IP Addressing 
[Subnets](https://learn.microsoft.com/en-us/azure/virtual-network/concepts-and-best-practices) are like different parts in your city. Each subnet can host various types of resources. For example, one subnet for web servers and another for databases, and [IP Addressing](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses) is how your resources find each otherᅳlike address numbers. 

## What Are Overlapping Subnets? 

Imagine you're the security guy in a marriage, and the bride and groom accidentally invite two groups of friends to the same table with the same name tag. Awkward, right? 🥴 That's what overlapping subnets are like in your Azure VNet. 

In technical terms, overlapping subnets occur when two or more subnets within the same Virtual Network (VNet) share IP address ranges that intersect or duplicate. This overlap confuses Azure's networking components, leading to traffic routing problems. 

### Example of Overlapping Subnets
Here, Subnet B's address is <code class="highlight">10.0.1.0/24</span> and ranges ( from <code class="highlight">10.0.1.128</span> to <code class="highlight">10.0.1.255</span>), which overlaps with Subnet A's address <code class="highlight">10.0.1.128/25</span> and range ( from <code class="highlight">10.0.1.0</span> to <code class="highlight">10.0.1.255</span>). 

## Why Should You Avoid Overlapping Subnets?

1. Azure won't know which subnet to send traffic to, causing unpredictable behavior by this **confusion**. (If any of your subnets are overlapping after the <code class="highlight">Terraform apply</span> command an error will pop up) 
2. Creating or updating resources may fail due to IP **conflicts**. 
3. Misrouted traffic can expose sensitive data or allow unauthorized access, leading to **security** risks. 
4. Your resources might not **communicate** as intended, leading to downtime. 

In short, overlapping subnets are like having two different coffee shops with the same name in your city. Customers (or in this case, your data packets) get confused about where to go! ☕️☕️

## How to Prevent Overlapping Subnets

1. Before creating subnets, map your VNet's address space, ensuring each subnet has a unique and non-overlapping range. 
2. [Classless Inter-Domain Routing (CIDR)](https://docs.netgate.com/pfsense/en/latest/network/cidr.html) allows you to define IP address ranges and allocate distinct blocks for each subnet. 
3. Keep a documented detailed record of your VNet and subnet configurations, preventing accidental overlaps during expansions or modifications. 
4. Using Terraform can help enforce non-overlapping subnets using variables and modules that check for IP range conflicts. 

**Talk is cheap, let's go with a Terraform example:**
<br>
* If you don't have Terraform installed, please follow this [amazing documentation](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli) provided by Hashicorp.

``` js
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "myResourceGroup"
  location = "East US"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "myVNet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet_web" {
  name                 = "webSubnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "subnet_db" {
  name                 = "dbSubnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}
```
*See? Building your VNet is easier than assembling IKEA furniture 🛠️*

## What are Network Security Groups (NSGs)?

⁤Imagine you're hosting a party (analogy for your VNet), and you wanna control who gets in and out. ⁤⁤NSGs are like the security guard at the door, deciding which traffic is allowed and which isn't based on predefined rules. ⁤⁤They help protect your Azure resources by filtering network traffic to and from resources in a VNet. 

### Key Features of NSGs
* Define what traffic is allowed in and out with **Inbound and Outbound Rules**. ⁤
* Rules are processed based on **priority numbers**. 
  1. Lower numbers have higher priority
  2. The first matching rule determines the action.
  3. If no rules match, default rules are applied (e.g., deny all inbound traffic by default).
* Apply NSGs at different levels for granular control associated with Subnets and Network Interfaces. 

NSGs contain a list of security rules that allow or deny network traffic based on factors like, Source and Destination IP Addresses, Ports and Protocols, and traffic direction (Inbound or Outbound). So, when a data packet tries to enter or leave a resource, the NSG evaluates it against its rules and decides whether to allow or deny the traffic.

### Pros of Using NSGs
1. Granular Control allows you to define precise rules for specific traffic, giving you fine-tuned control over your network security. ⁤
2. Cost-Effective given that NSG is a built-in feature of Azure VNets, meaning you don't have to pay extra for basic network security. ⁤
3. With a user-friendly interface and integration with tools like Terraform, managing NSGs is straightforward. ⁤
4. NSGs can be applied to multiple resources, subnets, or entire VNets, making them **scalable** as your infrastructure grows. ⁤
5. NSGs work **seamlessly** with other Azure services, enhancing your overall security posture. 

### Cons of Using NSGs
1. NSGs operate at Layer 4 (Transport Layer) of the OSI model, meaning they can't inspect the content of the traffic (like Layer 7 does). ⁤
2. As the number of rules grows, managing and troubleshooting them can become challenging. ⁤
3. NSGs are stateless for outbound traffic, which means return traffic is automatically allowed. ⁤⁤If not configured carefully, this could potentially expose resources. ⁤
4. While NSGs provide basic logs, they lack advanced monitoring capabilities compared to dedicated security appliances. ⁤

## What is VNet Peering? 

It's a seamless and secure way to communicate between VNets, like building a private bridge between two islands. It's fast, cost-effective, and allows VNets to keep logically separated while communicating across regions or within the same Azure Region. 

### Key Features of Vnet Peering 

1. Low latency, as the communication is routed directly within the Azure Backbone network, meaning that it's fast and doesn't require any gateway or public internet traffic. Perfect high-speed data transfer across applications. 
2. Peering Vnets within the same region (Intra-Region Peering) or VNets located in different Azure regions (Global VNet Peering). This is very useful for global apps where resources are spread across different regions. 
3. By peering two VNets, you can access resources like databases, share load balances, Application Gateways, or other network services. 
4. VNet A can communicate with VNet B but cannot automatically talk to VNet C through VNet B (non-transitive). You still route traffic between multiple VNets using a Network Virtual Appliance (NVA) like Azure Firewall or an on-premises VPN device. 
5. The communication between peered VNets takes place using private IP addresses, so no public IP is required. 
6. Applying NSGs and route tables to control traffic between peered VNets can ensure granular control over traffic flow between networks. 

### Pros of VNet Peering 

1. It is cost-effective in comparison with VPN Gateway, as it doesn't incur data processing changes for network traffic. You only pay for the data transferred between the VNets, making it a cheaper option than using VPN or ExpressRoute.
2. Doesn't require a complex setup like Gateways or VPNs.
3. Very performative as VNets communicate directly over Azure's backbone network.
4. With NSGs and custom route tables, you can allow filter and monitor traffic between VNets.
5. Very scalable by expanding your infrastructure across multiple VNets and regions seamlessly.

### Cons of VNet Peering 

1. Routes between multiple VNets are more complex if they are part of a more extensive network topology.
2. Careful IP space planning, especially in large organizations with many VNets, to avoid overlapping. 
3. Vnet peering doesn't inherently allow the use of gateway transit (i.e., one VNet has the VPN Gateway, another peered VNet cannot use that gateway unless you explicitly configure gateway transit). 