# Owner launch checklist

The public privacy and account deletion pages now use these launch values:

- Legal publisher / Google Play developer name: Phantom Code
- Support contact email: reactioncreatorteam@gmail.com
- Privacy contact email: reactioncreatorteam@gmail.com
- Public business address: not included on the website policy pages unless
  Google Play specifically requires one
- Website domain: www.reactioncreator.com
- Public privacy policy path: /privacy-policy/
- Public account deletion path: /account-deletion/
- Current policy date: August 27, 2026
- Account deletion cancellation period: seven days, followed by scheduled processing
- Production retention wording: scoped to the data the deletion worker actually removes
- RevenueCat deletion process: manual support request where supported
- Google Play subscription cancellation: handled by the user through Google
  Play
- Target audience: teens and adults who create and edit reaction videos
- Google Play Families program: not intended for submission

## Actions still required outside this website

- Publish the Google Play store listing. Until it is publicly available, the
  website shows “coming soon” instead of sending visitors to a broken listing.
- Replace Google test AdMob IDs in the Android release build with production
  AdMob IDs before release.
- Add an easy-to-find Privacy Policy link inside the Android app.
- Complete and review the Play Console Data safety form so it matches the
  Privacy Policy, Android permissions, Firebase, AdMob, UMP, RevenueCat, and the
  final signed app.
- Declare ads in Play Console and verify the AdMob and UMP privacy settings.
- Complete the foreground service declaration and upload the required video for
  the app's media-processing foreground service.
- Choose the same teen/adult target audience everywhere and complete the content
  rating questions for imported, recorded, user-created, exported, and shared
  media.
- Provide valid Play Console app-access instructions if reviewers must sign in.
- Monitor reactioncreatorteam@gmail.com, verify ownership for email deletion
  requests, and complete those requests securely.
- Test the production account-deletion flow after the final backend and Android
  release are deployed.
