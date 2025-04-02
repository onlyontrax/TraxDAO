### Q1 Review + Q2 Roadmap + Budget

**Founder’s Note**

Interesting quarter to say the least in the ICP ecosystem. We’ve kept ourselves out of the politics and turmoil and got a lot of productive work done - improving the platform, generating successful use cases with a handful of exciting artists. The [White Lies release](https://trax.so/video/?id=big-tv---live-@-lafayette--full-concert-) which took a lot of planning was a real win, with hundreds of their fan base joining TRAX and purchasing the live version of the show. Hopefully, this gives us more ammunition to expand our partnership with Red Light Management and onboard more artists from their impressive roster. Excited to continue refining the platform features and make TRAX a more sticky and useful tool for artists. 

Very pleased with how the development of Lyra is coming along. Lyra is a brand new AI visualiser we have developed for TRAX alongside Olali (AI audio-visual artist) and Rock Badger Consulting. Please watch the video to see how it works and some early outputs from the model. Think this is really going to take off once integrated and supercharge organic usage of the TRAX platform :)

ICP price performance is entirely out of our control but available capital dropping 60%+ in the last 3 months is certainly complicating the process of managing funds, growing the developer team and investing in growth initiatives. We have pared back significantly on our spending compared to last year and will continue to operate more cautiously given the market. With this in mind, securing more funding and reducing our reliance on treasury funds is also a priority for me in Q2. The “investment” from Victus Capital unsurprisingly failed to materialise but, alongside our advisor Stephen King, we are optimistic about our chances of raising external capital from VC/angels who are seeking to invest in the growing ‘superfan’/’direct-to-fan’ music space. 

Here’s to a fruitful quarter for the legitimate teams and projects building in this ecosystem!

# 1. Q1 Development Review

In Q1, we focussed on several key features and platform improvements, as set out in [our Q1 roadmap proposal.](https://nns.ic0.app/proposal/?u=ecu3s-hiaaa-aaaaq-aacaq-cai&proposal=82)

Here’s our progress on each task:

## 1.1 Authentication & Account Structure

> “TRAX will implement 1-click authentication alongside a revamped account structure featuring specialised artist and fan sub-accounts. This architectural update will significantly improve navigation and platform usability, creating distinct experiences tailored to each user type.”

- ✅ Optimised Sign-Up Flow - A streamlined onboarding process enhances user experience and reduces friction. The time to create an artist account has been greatly reduced, it is also much easier to sign up via web3 and non-web3 authentication methods.
- ✅ Artist & Fan Account Merging - Users can now switch between artist and fan accounts without requiring separate logins.
- ✅ New Sign-Up & Login Options - Gmail, Apple, and Facebook sign-in options have been added for faster account access.

## 1.2 Improving Payments & Smart Contracts

> “A comprehensive payment infrastructure upgrade will introduce Apple Pay, Google Pay, and Stripe Express checkout capabilities, alongside enhanced smart contracts. The new 'pay what you want' model will provide flexible pricing options for artists. Improved wallet connectivity via Internet Identity, Plug Wallet & OISY wallet will ensure seamless Web3 integration.”

- ✅ Expanded Payment Options - Apple Pay, Google Pay, and Link Pay are now available for subscriptions, pay-per-access, and tipping, providing a more seamless transaction experience.
- ✅ Optimised PPV & Tipping Smart Contracts - Enhanced smart contract performance and security for pay-per-view content and tipping transactions.

Specifically:

- Added event logging
- Added Rate limiting checks
- More robust reentrancy guards
- Migrated to transferFrom logic for improved TX speed
- Better error handling
- More efficient storage patterns
- Reduced redundant state
- Refactored code for better readability

- 👷‍♂️ Pay What You Want - we didn’t prioritise this feature but will look to finalise the implementation and release in Q2.
- 👷‍♂️ Improved Wallet Connectivity - given persistent issues with Plug Wallet’s mobile connectivity, we are refocussing efforts on integrating OISY wallet via the Typescript package [signer-js](https://github.com/slide-computer/signer-js)

## 1.3 Mobile App Development

> "The mobile abstraction layer will be a key focus for Q1, paving the way for iOS app deployment. This technical foundation will ensure consistent performance across all mobile platforms while maintaining the platform's core functionality."

- ✅ App version released to [Google Play](https://play.google.com/store/apps/details?id=com.trax.trax&hl=en)

- ✅ Changes to mobile application for iOS Release:
  - Remove tracking to comply with App Tracking Transparency Framework
  - Alterations to payment gateways to comply with InAppPurchase Framework
  - Enabled account deletion to comply with App Store Review Criteria
  - Fixed issues with Camera connectivity when updating profile photo or image upload from camera
  - Bug fixes on page redirects to remain within app vs redirect to website
  - Other minor bug fixes resulting from App Store Submission reviews!

## 1.4 Content Management Features

> "TRAX will introduce an integrated media player, comprehensive playlist functionality, and enhanced project upload capabilities. The new album feature will support combined audio and video uploads, providing artists with more versatile content presentation options."

- 👷‍♂️ Our integrated media player remains in development, delayed slightly by focus on our new AI visualisation feature [see 2. Lyra - TRAX’s New AI Music Visualiser].

We instead focussed on development of features requested by our community of artists:

- ✅ Artist Profile Personalisation - Artists can now customise their profile pages with unique themes and accent colours for a more branded experience.
- ✅ Improved Artist Earnings Dashboard - Improved metadata for Recent Activity and transaction logs, improved UI to display eligible and pending earnings.
- ✅ Advanced Analytics for Artists - Integration with Google Analytics to retrieve page views and location data (total views, total users, top locations); improved data portability by enabling artists to export followers’ email addresses. New dashboard UI allowing for better visibility of key metrics incl. temporal comparison over weekly, monthly and quarterly timeframe.
- ✅ Referrals - improved UI for artists to view and manage their referrals, enable artists to track referral activity and create unique referral links

## 1.5 Other Things We Did

- ✅ Redesigned Genre Filter Pages - Updated design for improved navigation and content discovery.
- ✅ Updated Navigation Menu - A redesigned menu structure improves accessibility and usability.
- ✅ General Bug Fixes & Performance Improvements - Various optimisations to enhance platform stability and responsiveness.
- ✅ Open Graph Image Meta Tags - Improved link previews for better sharing on social platforms.
- ✅ Optimised Track & Video Thumbnails - Enhanced visuals for a smoother user experience.
- ✅ Improved UI: Studio Page - A refreshed design for a more intuitive workflow.

# 2. Lyra - TRAX’s New AI Music Visualiser

Lyra processes music into one-of-a-kind dynamic video artworks. Advanced particle render technology allows us to generate highly complex visual patterns that are unique every time.

To date we have produced an MVP in a local test environment. The model is fully compatible with user-supplied audio and image files, and offers a range of adjustable colour and shape presets. Development in Q2 will prioritise moving Lyra from the test environment to a cloud setting, allowing us to test processing capabilities and pave the way for full integration into the TRAX platform.

The AI music market is focussed mostly on audio production utility. Lyra is unique as an AI artist in its own right, offering users a more engaging way to share new music.

🎥 [Watch the live demo](https://trax.so/video/?id=trax-lyra)

# 3. Q1 Growth & Traction

- **Project traction:**
  - 700 new users onboarded to ICP through TRAX
  - Onboarded users are highly engaged, with stats reflected in wallet creation and engagement across artist profiles.

- **Artist partnerships:**
  - Promotions from key trending artists in diverse genres:
    - Alt-rap pioneer Polo Perks (30k Insta; 55k Spotify)
    - London bedroom pop sensation Jimothy Lacoste (102k Insta; 51k Spotify)
    - Indie staple White Lies (78k Insta; 736k Spotify)
    - Ongoing collaboration with Red Light Management — home to 350+ artists globally

- **Reach and marketing:**
  - TRAX secured a panel slot at the inaugural **SXSW London** in June.  
    Topic: *"Where are the superfans?"*, promoted to 20,000+ global music industry visitors.
  - Artist promotions reached over **330,000 Instagram users** in Q1

- **TRAX Case Study:**
  - White Lies sold **100+ copies** of their recorded show *Live at Lafayette*, targeting their exclusive superfan list of 400.
  - This validates TRAX as a **high-converting digital sales format** for exclusive drops.

# 4. Q2 Roadmap

## 4.1 Platform Development

We’re planning on some major changes to the TRAX platform in Q2. The overarching goal is to transition away from competing with streaming/media platforms and towards being an easy-to-use tool that empowers artists to share exclusive content while growing their fanbase, audience data and revenue streams.

With that in mind, we intend to prioritise the following features in Q2:

### Access Control & Unlock Methods

A major Q2 priority is introducing non-financial unlock methods that reflect how fans already engage with artists. This includes unlocking content via email, phone number, entry code, or by following on social platforms. We will also integrate the Spotify API to enable content unlocks based on pre-saves or follows. Artists will have a flexible new way to permission access while capturing more fan data.

### Authentication & Fan Onboarding

Streamline fan account creation by combining it with content unlocking. Add mobile-first authentication (via Twilio) to allow users to create accounts using their phone number, with a built-in verification flow. This update will support wider adoption across mobile-first markets and improve early user engagement.

### Web3 Infrastructure & Ecosystem Features

We’ll complete our integration with OISY wallet for seamless Web3 authentication and payments. Artists will be able to price content in a wider range of currencies, and we’re exploring the reintroduction of decentralised storage via canister uploads if the subnets allow it. Add OpenChat to social links to allow artists to create fan communities on the Internet Computer.

### Artist Onboarding & Profile Tools

Enhance visibility of artist account creation within the platform and add some splash screens to help new artists publish and promote their first drop. Artist profiles will become fully customisable, allowing for branded colours, fonts, social links, and logos — positioning each profile as a fully functional link-in-bio landing page.

### Direct-to-Fan Messaging

Artists will gain new communication tools, enabling them to message fans directly via email or SMS. These messages can include new drops, announcements, or tour updates. A revamped email builder and Twilio-powered SMS integration will allow artists to activate their audience from their dashboard.

### Mobile & Content UX

We’re refining the mobile and content experience, including a more elegant locked vs unlocked content UI and the option for artists to make content downloadable after unlock (thanks for the request — Jerry Banfield). Artist feeds will be streamlined into a single content stream to improve discoverability and engagement. Hopefully Apple approve our App Store listing this quarter…

## 4.2 Growth Roadmap

In Q1, the TRAX Airdrop Campaign brought over 700 new users into the Internet Computer ecosystem. In Q2, we’re relaunching and expanding the campaign with daily engagement tasks designed to drive repeat visits and deepen interaction with both the TRAX platform and the broader ICP ecosystem.

We’re also preparing to launch the Beta of Lyra — TRAX’s generative AI visualiser — adding a powerful new creative layer to the platform. With strong artist partnerships and a targeted promotional push, we expect Lyra to generate significant viral momentum. We’ll use this to ultimately create a compelling new on-ramp into the protocol.

## Use of Funds & Budget

- **Team Salaries and Contractor Fees**: Pay team salaries, advisor compensation, other contractor fees (e.g. graphic designer)
- **Overheads**: Costs related to company functioning, office rent (notice given this month), accounting firm, etc.
- **Third-Party Services**: Tools, technologies, and services necessary for TRAX operations, including AI integration costs
- **Promotional Spend**: Payment to White Lies for campaign and case study
- **Lyra Development**: Payment to RockBadger/Olali for completion of Milestone 2

**Q2 2025 Treasury Request:**  
We are requesting **28,000 ICP** to cover the above costs and successfully complete the roadmap.  
This increase from Q1’s 14,000 ICP reflects the unfortunate depreciation of $ICP in Q1. Hoping for a swift recovery!