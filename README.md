# Taply

Helper for creating tappable components.

It allows to handle pressed, hovered and focused states consistently
across different input methods - mouse, touch and keyboard.

- Fixes sticky hover and pressed state for touch
- Prevents focus when using mouse and touch, but still allows to focus using keyboard

## Install

```
npm install taply
```

## Example

```js
import Taply from 'taply/lib/new'

const tappableElement = (
    <Taply
        onTap={() => console.log('Tap')}
        onChangeTapState={tapState => {
            // tapState is an object with keys 'isHovered', 'isPressed' and 'isFocused'
            this.setState(tapState)
        }}
    >
        <div>Tap me</div>
    </Taply>
)

// Any component can be a child (React components should forward ref to inner DOM-element)
const tappableComponent = (
    <Taply {...props}>
         <SomeComponent />
    </Taply>
)

// Also, you can use function that takes tapState and returns element
const tappableFn = (
    <Taply {...props}>
        {(tapState, ref) => (
            <div style={{ color: tapState.hovered ? 'red' : 'black' }} ref={ref}>Tap me</div>
        )}
    </Taply>
)
```

## Props

### children
Type: `element|(tapState: object, ref) => element`

Tap state is an object with following properties: `isHovered`, `isPressed` and `isFocused`.

### onTap
Type: `(event) => void`

Tap event handler.

### onChangeTapState
Type: `(tapState) => void`

Handler of state changes.

### onTapStart
Type: `(tap: object) => void`

### onTapEnd
Type: `(tap: object) => void`

### onFocus
Type: `(event: object) => void`

Focus event handler.

### onBlur
Type: `(event: object) => void`

Blur event handler.

### isDisabled
Type: `bool`

Disables events handling.

### isFocusable
Type: `bool`
<br>
Default: `true`

### tabIndex
Type: `string|number`
<br>
Default: `0`

HTML `tabindex` attribute.

### preventFocusOnTap
Type: `bool`
<br>
Default: `true`
