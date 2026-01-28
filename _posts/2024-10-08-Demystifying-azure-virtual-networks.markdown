---
layout: post
title:  Demystifying Azure Virtual Networks (VNet)
description: 
date: 2024-10-08 20:00:00 +0300
image: '/images/virtual-network.jpg'
tags: [Azure, Networking, VNet, Terraform]
---
Hello everyone, welcome to my first blog post! 👋
If you ever wondered how your Azure resources could keep chatty, privately, not being "disturbed" by the outside world, then follow me in this article. Today, we dive into the networking world of [Azure Virtual Networks (VNet)](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview). This guide will take you through setting up your secure and efficient VNet using Terraform, irrespective of your experience in the DevOps world or if you're just starting your cloud path.

## What is Azure Virtual Network (VNet)? 

Think of Azure Virtual Network as your own neighborhood in this big Azure city. Just like you have streets, houses, and maybe a coffee shop around the corner, VNet provides a secure and isolated environment where your Azure resources, like Virtual Machines, Databases, etc., are allowed to communicate with each other and the outside world in a safe and efficient manner.

## Why Should You Care?
* First, **security** protects your data more vigilantly than the most prized Pokémon card.
* Enhance **control**, directing the flow of traffic with ease, like a traffic policeman in your Azure resources.
* Scale up or down with **flexibility** without effort-or your network.

## Key Components of VNet 
Now, let's dive into the key components involved with a VNet. Consider this as building and adding bricks to your cloud city.

#### Subnets and IP Addressing 
Well, the concept of subnetting is to divide your city into different parts, just like in your hometown. And each of those subnets can host various kinds of resources. For example, one subnet for web servers, another subnet for databases. And [IP Addressing](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses) is how your resources find each otherᅳlike address numbers.

## What Are Overlapping Subnets? 

It would be as if you were the security guy at a marriage, and the bride and groom inadvertently invited two groups of friends to the same table with the same name tag. That's basically what it feels like for your Azure VNET when you have overlapping subnets.

Overlapping of subnets, technically speaking, means that inside one single VNet, there exist two or more subnets with the IP address range being either duplicated or having commonalities. This duplication is leading to a result of deceiving the networking components of Azure as much that it perturbs in routing the traffic.

#### Overlapping Subnets Example
Here, the address of Subnet B is <span class="highlight">10.0.1.0/24</span> and its range is from <span class="highlight">10.0.1.128</span> to <span class="highlight">10.0.1.255</span>, overwriting the address of Subnet A, which is <span class="highlight">10.0.1.128/25</span>, and whose range is from <span class="highlight">10.0.1.0</span> to <span class="highlight">10.0.1.255</span>.

## Why Should You Not Have Overlapping Subnets?

1. Azure won't know which subnet traffic should be sent to-unpredictable behavior caused by this **confusion**. If any of your subnets overlap, then after the <span class="highlight">Terraform apply</span> command, an error will pop up.
2. IP **conflicts** can cause creation or updates of resources to fail.
3. Misrouting traffic may expose sensitive data or permit unauthorized access creating **security** risks.
4. Resources may not **communicate** as expected and thereby lead to downtowns.

Explaining it in another way, overlapping subnets are basically like having two cafes with the same name in your city. Customers-or in this case, your data packets-get confused about which location to go to!

## Overlapping Subnets Prevention

1. Create an address space mapping for your VNet ahead of time before creating any subnets, with each subnet getting a unique, non-overlapping range for its address space.
2. [CIDR](https://docs.netgate.com/pfsense/en/latest/network/cidr.html) allows you to plan your IP address ranges and allocate different blocks to each subnet.
3. Write down all your VNet and subnet configurations on paper in as much detail as possible, which may also avoid accidental overlaps during expansion or changes.
4. Terraform can manage non-overlapping subnets by using variables and modules that check for conflicts in the IP ranges.

**Talk is cheap, let's go with a Terraform example:**
<br>
*  If you don't already have Terraform installed, please follow [great documentation](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli) provided by Hashicorp here.

``` js
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "myResourceGroup"
  location = "eastus2"
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

Think of having a party, which for this example, shall be your analogy to your VNet: suppose you wanted to control who gets in and out. The NSGs are like that security guard at the door who allows which traffic and blocks which, based on pre-defined rules. They enable one to protect one's Azure resources by filtering inbound and outbound network traffic to and from resources in a VNet.

#### Main Characteristics of NSGs
* Inbound and Outbound Rules: Indicate what traffic is allowed in and out. ⁤
* Priority numbers will tell the sequence of rule processing.
1. Lower numbers are higher in priority
2. The first matching rule dictates action.
3. If none of the rules match, then the defaults are applied, such as deny by default for all inbound traffic.
* Granular control for NSGs applied at various levels associated with subnets and network interfaces.

NSGs are an ordered list of security rules that allow or deny network traffic based on criteria such as, amongst others, Source and Destination IP Addresses, Ports and Protocols, and the flow of traffic - Inbound or Outbound. As such, when a packet of information tries to enter or exit a resource, the NSG checks the same against its set of rules and makes a decision to Allow or Deny the same.

#### Advantages of Using NSGs
1. Granular Control: It enables the setting of rules for specific traffic, hence offering the ability to finetune your network security. ⁤
2. Cost-Effective: Since NSG is an Azure VNet-integrated service, you don't have to incur additional expenses for basic network security. ⁤
3. Easy Management: NSG management is relatively easy since it has a pretty user-friendly interface and is also integrated with tools such as Terraform.
4. NSGs can be applied at multiple levels-from a few resources to subnets or even complete VNets-thus making them **scalable** for your infrastructure's growth. ⁤
5. NSGs ensure **seamless integration** with other services provided by Azure, enhancing overall security posture.

#### Cons of Using NSGs
1. NSGs operate at Layer 4 (Transport Layer) of the OSI model, meaning they can't inspect the content of the traffic as Layer 7 does. ⁤
2. Too many rules are hard to manage and debug. ³
3. NSGs are stateless for outbound traffic. The return traffic is allowed automatically. ³³Planned negligently, this could expose resources. ³
4. Although NSGs do provide some basic logs, advanced monitoring possible with a dedicated security appliance would not be available. ³

## What is VNet Peering?

This will, in turn, provide a seamless and secure manner of communicating between VNets, similar to building a private bridge between two islands. It is fast, cost-effective, and allows VNets to keep logically separated while communicating across regions or within the same Azure Region.

#### Key Features of Vnet Peering

1. Low latency, since it routes the communication directly inside the Azure Backbone network, hence fast and does not require any gateway or public internet traffic. Perfect high-speed data transfer across applications.
2. Peering VNets within the same region, known as Intra-Region Peering or VNets across different Azure regions, also known as Global VNet Peering. Very useful for global apps when their resources spread across different regions.
3. Peering of two VNets allows you access to resources such as databases, sharing load balances, Application Gateways, and other network services.
4. While VNet A communicates with VNet B, it cannot automatically talk with VNet C through VNet B, which is non-transitive. You still route the traffic between multiple VNets using a Network Virtual Appliance (NVA), like Azure Firewall or an on-premises VPN device.
5. Peered VNets communicate using private IP addresses; therefore, no public IP is required. 6. Applying NSGs and route tables to control the flow of network traffic between peered VNets would provide granular level control over the flow of network traffic between the networks.

1. Economical as compared to VPN Gateway, because there are no changes in data processing for network traffic. You pay only for the data transferred between VNets; thus, lower in cost compared to VPN or ExpressRoute.
2. No complicated setup is required as in the case of Gateways or VPNs.
3. It is highly performant because VNets can communicate directly over the backbone network of Azure.
4. NSGs and custom route tables can allow filtering and monitoring of traffic between VNets. 5. Highly scalable since you will expand your infrastructure across multiple VNets and regions seamlessly.

#### VNet Peering Disadvantages

1. More complicated routes between multiple VNets if they become part of a larger network topology. 2. Planning of IP spaces should be strictly done, especially for large organizations with numerous VNets so as not to have any overlapping.
3. Vnet peering does not, by default enable the usage of gateway transit, which means one VNet has the VPN Gateway, another peered VNet cannot use that gateway unless you explicitly config gateway transit.

``` js
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "myResourceGroup"
  location = "eastus2"
}

# VNet 1
resource "azurerm_virtual_network" "vnet1" {
  name                = "myVNet1"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet_web_vnet1" {
  name                 = "webSubnet1"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet1.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "subnet_db_vnet1" {
  name                 = "dbSubnet1"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet1.name
  address_prefixes     = ["10.0.2.0/24"]
}

# VNet 2
resource "azurerm_virtual_network" "vnet2" {
  name                = "myVNet2"
  address_space       = ["10.1.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet_web_vnet2" {
  name                 = "webSubnet2"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet2.name
  address_prefixes     = ["10.1.1.0/24"]
}

resource "azurerm_subnet" "subnet_db_vnet2" {
  name                 = "dbSubnet2"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet2.name
  address_prefixes     = ["10.1.2.0/24"]
}

# Network Security Group
resource "azurerm_network_security_group" "nsg" {
  name                = "myNSG"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# NSG Rules
resource "azurerm_network_security_rule" "allow_inbound_http" {
  name                        = "AllowInboundHTTP"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "80"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
}

resource "azurerm_network_security_rule" "allow_outbound_https" {
  name                        = "AllowOutboundHTTPS"
  priority                    = 200
  direction                   = "Outbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "443"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
}

# Associate NSG with Subnet
resource "azurerm_subnet_network_security_group_association" "webSubnet1_nsg_association" {
  subnet_id                 = azurerm_subnet.subnet_web_vnet1.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

resource "azurerm_subnet_network_security_group_association" "dbSubnet1_nsg_association" {
  subnet_id                 = azurerm_subnet.subnet_db_vnet1.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# VNet Peering between VNet1 and VNet2
resource "azurerm_virtual_network_peering" "vnet1_to_vnet2" {
  name                      = "vnet1-to-vnet2"
  resource_group_name       = azurerm_resource_group.rg.name
  virtual_network_name      = azurerm_virtual_network.vnet1.name
  remote_virtual_network_id = azurerm_virtual_network.vnet2.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_virtual_network_peering" "vnet2_to_vnet1" {
  name                      = "vnet2-to-vnet1"
  resource_group_name       = azurerm_resource_group.rg.name
  virtual_network_name      = azurerm_virtual_network.vnet2.name
  remote_virtual_network_id = azurerm_virtual_network.vnet1.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

```

#### Explanation of Key Components
* Network Security Group (<span class="highlight">azurerm_network_security_group</span>): This is the definition of a security group named myNSG.
* NSG Rules:
  * <span class="highlight">AllowInboundHTTP</span>: Allows inbound HTTP traffic on <span class="highlight">port 80</span>.
  * <span class="highlight">AllowOutboundHTTPS</span>: Allows outbound HTTPS traffic on <span class="highlight">port 443</span>.
* NSG Association (<span class="highlight">azurerm_subnet_network_security_group_association</span>): 
  * Associates the NSG with specific subnets in vnet1.
* VNet Peering (<span class="highlight">azurerm_virtual_network_peering</span>):
  * <span class="highlight">vnet1_to_vnet2</span> and <span class="highlight">vnet2_to_vnet1</span> set up bidirectional peering between vnet1 and vnet2.
  * <span class="highlight">allow_virtual_network_access</span> and <span class="highlight">allow_forwarded_traffic</span> are enabled to allow traffic flow between peered VNets.

## Conclusion
This is a core competency, right at the heart of all security and efficient communication across your resources in the cloud. With Terraform, you make it easier to provision and set up VNets, subnets, and NSGs while having much less stress in keeping track and maintaining control of network traffic throughout your infrastructure.