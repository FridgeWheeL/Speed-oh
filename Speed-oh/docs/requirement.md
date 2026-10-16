# Speed Limit Companion - Requirements

## 1. Purpose
Build a lightweight personal driving companion that focuses on one feature: showing the driver's live GPS speed alongside the speed limit for the road currently being travelled.

The experience should resemble the useful speed indicator in Waze without navigation, routing, maps, accounts, social features, or other distractions.

The initial proof of concept (POC) will run as an installable web application/PWA on an iPhone and will be developed entirely from a Windows PC.

## 2. Primary User Story
As a driver, I want to see my current GPS speed and the speed limit of the road I am travelling on, so that I can quickly tell whether I am approaching or exceeding the speed limit.

Example:
- Current speed: 50 km/h
- Road speed limit: 60 km/h
- As the current speed approaches or reaches the configured threshold, the display changes visually.
- If the vehicle exceeds the speed limit, the warning state is immediately obvious.

## 3. POC Scope
The POC must provide:

1. Live GPS location from the iPhone.
2. Live GPS-derived vehicle speed.
3. Identification of the road the user is currently travelling on.
4. Retrieval of the likely speed limit for that road using OpenStreetMap data or another free/open source suitable for the POC.
5. A large, simple current-speed display.
6. A clearly visible current road speed-limit display.
7. Visual indication when approaching, reaching, or exceeding the speed limit.
8. A Start Driving / Stop Driving session.
9. Screen Wake Lock where supported so the iPhone does not automatically lock while the driving screen is active.
10. PWA/Home Screen support so the application can feel similar to a standalone app without requiring App Store distribution.

## 4. Out of Scope for the Initial POC
The following are explicitly excluded unless added in a later phase:

- Turn-by-turn navigation.
- Route planning.
- Traffic routing.
- User accounts.
- Social features.
- Police, hazard, accident, or traffic reporting.
- App Store publication.
- Native iOS application packaging.
- Android-specific packaging.
- Paid map/speed-limit APIs.
- Analytics or advertising.
- Persistent location history.

## 5. Target Environment

### Development
- Windows PC.
- .NET is familiar to the developer, but the POC does not need to be .NET if a browser-first TypeScript implementation is simpler and more appropriate.
- Development must not require owning a Mac.

### Runtime
- Primary target: iPhone.
- Browser: Safari / installed PWA.
- The application is intended initially for personal use.

## 6. Functional Requirements

### FR-001 - Start Driving Session
The user must be able to explicitly start a driving session.

When started, the application must:
- Request location permission if required.
- Begin continuous GPS tracking.
- Begin updating current speed.
- Begin determining the current road and speed limit.
- Request a screen wake lock where supported.

### FR-002 - Stop Driving Session
The user must be able to stop the driving session.

When stopped, the application must:
- Stop continuous location tracking.
- Release the screen wake lock.
- Stop unnecessary network requests.

### FR-003 - Live GPS Position
The application must continuously receive location updates while driving mode is active.

Each useful location sample should include where available:
- Latitude.
- Longitude.
- Timestamp.
- Location accuracy.
- GPS-provided speed.
- Heading, if useful for road matching.

### FR-004 - Current Vehicle Speed
The application must display the user's current speed in kilometres per hour.

The implementation should prefer GPS-provided speed when available.

Invalid values such as null, negative, non-finite, or stale readings must not be displayed as valid speeds.

### FR-005 - Speed Filtering
GPS measurements may fluctuate. The application should apply lightweight filtering or smoothing so the displayed speed remains responsive without visibly jumping between noisy readings.

Filtering must not introduce excessive delay.

### FR-006 - Road Matching
The application must determine the most likely road segment associated with the current GPS position.

Road matching should consider, where practical:
- Distance from the road.
- Direction of travel.
- GPS accuracy.
- Previous matched road.
- Nearby parallel roads.
- Intersections and road transitions.

The application must support an unknown/unmatched state rather than confidently selecting an unreliable road.

### FR-007 - Speed Limit Resolution
For the matched road, the application must attempt to determine the posted speed limit from OpenStreetMap data or another approved free/open source.

The resolver should support common OpenStreetMap `maxspeed` values and gracefully handle:
- Missing values.
- Unknown values.
- Conditional limits.
- Direction-specific limits.
- Unsupported or malformed values.

The application must never invent a speed limit when none can be determined reliably.

### FR-008 - Speed Limit Display
The current speed limit must be displayed prominently alongside the current vehicle speed.

If the speed limit is unknown, the UI must clearly display an unavailable state rather than a guessed number.

### FR-009 - Driving State
The application must classify the current state into at least:
- Below speed limit.
- Approaching/at speed limit.
- Above speed limit.
- Speed limit unavailable.

A small configurable tolerance and/or hysteresis should prevent rapid visual flickering when speed oscillates around the threshold.

### FR-010 - Visual Warning
When the vehicle reaches or exceeds the configured warning threshold, the speed display must change visually.

The above-limit state must be immediately recognisable without requiring detailed reading of the screen.

The exact colours and thresholds should be configurable during development.

### FR-011 - Screen Wake Lock
While driving mode is active, the application should use the Screen Wake Lock API where supported.

If the browser releases the lock when the application loses visibility, the application should attempt to reacquire it when appropriate after becoming visible again.

Unsupported devices must degrade gracefully.

### FR-012 - PWA Support
The application must be installable to the iPhone Home Screen where supported.

It should include:
- Web app manifest.
- Application name.
- Icons.
- Standalone display configuration.
- Service worker where appropriate.

### FR-013 - Error States
The application must provide understandable states for:
- Location permission denied.
- GPS unavailable.
- Poor GPS accuracy.
- Network unavailable.
- Road cannot be matched.
- Speed limit unavailable.
- Speed-limit service unavailable.

## 7. User Interface Requirements
The UI should be intentionally minimal and optimised for quick glances while mounted in a vehicle.

The primary driving screen should contain:
- Large current-speed value.
- `km/h` unit.
- Clearly visible road speed limit.
- Driving-state visual treatment.
- Start/Stop control where appropriate.
- Small status/error indication when required.

A map is not required for the POC.

The interface should avoid small interactive controls or unnecessary information while driving.

## 8. Data Source Requirements
The POC should prioritise free/open data.

OpenStreetMap is the initial preferred source for road and `maxspeed` information.

The implementation must isolate external mapping/data access behind interfaces so that the provider can later be replaced without rewriting the driving logic or UI.

The project must respect the usage policies of any public OpenStreetMap-related endpoint used during development. If public endpoints are unsuitable for continuous production use, that limitation must be documented rather than hidden.

## 9. Architecture Requirements
The system should separate the following concerns:

- Browser geolocation access.
- GPS speed normalisation/filtering.
- Road matching.
- External road-data access.
- Speed-limit parsing/resolution.
- Driving-state evaluation.
- Wake Lock handling.
- UI/presentation.

Core driving logic should be testable without requiring a real browser, GPS device, or live OpenStreetMap request.

Browser APIs and external HTTP services should be wrapped behind interfaces/services.

## 10. Suggested POC Technology
A suitable initial stack is:

- TypeScript.
- Vite.
- Progressive Web App support.
- Browser Geolocation API.
- Screen Wake Lock API.
- OpenStreetMap-based road/speed-limit data.
- Vitest or equivalent for automated tests.

A backend should not be introduced unless a concrete technical requirement makes it necessary.

## 11. Privacy Requirements
The POC should be privacy-first.

By default:
- No account is required.
- No location history is persisted.
- No analytics are collected.
- No advertising SDKs are included.
- GPS tracking only occurs during an explicitly started driving session.
- Tracking stops when the user stops the driving session.

## 12. Performance Requirements
The application should:
- Start quickly.
- Update speed responsively as GPS samples arrive.
- Avoid unnecessary road-data requests.
- Cache appropriate road/speed-limit information to reduce repeated lookups.
- Avoid excessive battery and mobile-data consumption.

## 13. Testing Requirements
Automated tests should cover core logic including:
- m/s to km/h conversion.
- Invalid GPS speed readings.
- Speed filtering.
- Speed-limit parsing.
- Missing speed limits.
- Below/near/above-limit classification.
- Threshold tolerance/hysteresis.
- Road-match confidence behaviour where practical.

Real-device testing should cover:
- Normal suburban roads.
- Changes between different speed zones.
- Intersections.
- Parallel roads.
- Roads without OSM speed-limit information.
- Poor GPS reception/accuracy.
- Location permission denial.
- Loss of network connectivity.
- Screen wake behaviour.
- Launching from the iPhone Home Screen.

## 14. Safety Requirements
This application is an advisory aid only.

The application must communicate that:
- Road signs and legally posted limits take precedence over application data.
- GPS speed can contain errors or delays.
- OpenStreetMap speed-limit information may be incomplete, outdated, or incorrect.
- The vehicle's instruments and road signage remain authoritative.
- The driver should not interact with the phone while the vehicle is moving.

## 15. POC Success Criteria
The POC is considered successful when, during a real iPhone driving test:

1. The user can launch the application from the Home Screen.
2. The user can start a driving session.
3. Current GPS speed updates continuously and is reasonably stable.
4. The application identifies the correct road often enough to evaluate the concept.
5. A valid speed limit is displayed where suitable source data exists.
6. The visual state changes clearly as the vehicle approaches or exceeds that limit.
7. The screen remains awake during the active session where the platform supports Wake Lock.
8. The application behaves safely when road or speed-limit information cannot be determined.
9. The entire POC can be developed from Windows without owning a Mac.

## 16. Future Possibilities
These are deliberately not part of the initial POC but may be considered later:

- Native iOS application.
- Android application.
- Audio warning when exceeding the limit.
- Configurable warning tolerance, for example +2 or +5 km/h.
- Better map matching using movement history.
- Local caching of frequently travelled roads.
- Temporary/variable speed-limit support.
- School-zone handling.
- Offline road/speed-limit datasets.
- CarPlay support, subject to Apple's platform requirements.
- Optional minimal map view.

## 17. Implementation Principle
Keep the first version tiny.

The central experiment is not whether we can build a navigation application. It is whether an iPhone PWA can reliably provide this loop:

**GPS position -> road match -> speed limit -> current GPS speed -> clear visual warning**

Everything else should remain secondary until that loop has been proven on real roads.
