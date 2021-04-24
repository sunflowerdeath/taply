import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import PropTypes from 'prop-types'

import { useIt, cloneElementWithRef } from './utils'

const ENTER_KEYCODE = 13

const makeTouches = (event, prevTouches) =>
	Array.from(event.targetTouches).map(touch => {
		const { clientX: x, clientY: y, identifier } = touch
		const prevTouch = prevTouches.find(t => t.identifier === identifier)
		if (prevTouch) {
			return { ...prevTouch, x, y, dx: x - prevTouch.x0, dy: y - prevTouch.y0 }
		}
		return { identifier, x, y, x0: x, y0: y, dx: 0, dy: 0 }
	})

const setTapState = (it, tapState) => {
	if (tapState.isPressed && (it.props.preventFocusOnTap || it.isTouched)) {
		it.shouldPreventFocus = true
		// On desktop we dont want to keep preventing if the focus event not
		// happening for some reason, because `Tab` button should work.
		// On mobile platforms focus event is very unpredictable, so once element
		// is touched, it will keep preventing next focus event whenever it will
		// happen.
		if (!it.isTouched) {
			setTimeout(() => {
				it.shouldPreventFocus = false
			})
		}
	}
	const nextTapState = { ...it.state.tapState, ...tapState }
	it.setState({ tapState: nextTapState })
	if (it.props.onChangeTapState) it.props.onChangeTapState(nextTapState)
}

const onMouseUp = (event, it) => {
	document.removeEventListener('mouseup', it.mouseUpListener)
	document.addEventListener('mousemove', it.mouseMoveListener)

	if (it.unmounted) return

	let isOnButton
	let elem = event.target
	while (elem) {
		if (elem === it.elem) {
			isOnButton = true
			break
		}
		elem = elem.parentElement
	}

	it.touches = []
	setTapState(it, { isPressed: false, isHovered: isOnButton })
	if (it.props.onTapEnd) it.props.onTapEnd(event, it.touches)
}

const onMouseMove = (event, it) => {
	if (it.state.tapState.isPressed && it.props.onTapMove) {
		const { clientX: x, clientY: y } = event
		const { x0, y0 } = it.touches[0]
		it.touches = [{ x0, y0, x, y, dx: x - x0, dy: y - y0 }]
		it.props.onTapMove(event, it.touches)
	}
}

const initScrollDetection = it => {
	it.scrollPos = { top: 0, left: 0 }
	it.scrollParents = []
	let node = it.elem
	while (node) {
		if (
			node.scrollHeight > node.offsetHeight ||
			node.scrollWidth > node.offsetWidth
		) {
			it.scrollParents.push(node)
			it.scrollPos.top += node.scrollTop
			it.scrollPos.left += node.scrollLeft
		}
		node = node.parentNode
	}
}

const detectScroll = it => {
	const currentScrollPos = { top: 0, left: 0 }
	it.scrollParents.forEach(elem => {
		currentScrollPos.top += elem.scrollTop
		currentScrollPos.left += elem.scrollLeft
	})
	return (
		currentScrollPos.top !== it.scrollPos.top ||
		currentScrollPos.left !== it.scrollPos.left
	)
}

const endTouch = (it, event) => {
	it.isTouched = false
	setTapState(it, { isHovered: false, isPressed: false })
	if (it.isPinching) {
		if (it.props.onPinchEnd) it.props.onPinchEnd(event, it.touches)
	} else if (it.props.onTapEnd) {
		it.props.onTapEnd(event, it.touches)
	}
}

const handlers = {
	mouseenter(event, it) {
		if (it.props.isDisabled) return
		if (it.shouldIgnoreMouseEvents) return
		setTapState(it, { isHovered: true })
	},
	mouseleave(event, it) {
		if (it.props.isDisabled) return
		if (it.shouldIgnoreMouseEvents) return
		setTapState(it, { isHovered: false })
	},
	mousedown(event, it) {
		if (it.props.isDisabled) return
		if (it.shouldIgnoreMouseEvents) {
			it.shouldIgnoreMouseEvents = false
			return
		}
		if (event.button !== 0) return
		it.mouseUpListener = e => onMouseUp(e, it)
		it.mouseMoveListener = e => onMouseMove(e, it)
		document.addEventListener('mouseup', it.mouseUpListener)
		document.addEventListener('mousemove', it.mouseMoveListener)
		setTapState(it, { isPressed: true })
		if (it.props.onTapStart) {
			const { clientX: x, clientY: y } = event
			it.touches = [{ x, y, x0: x, y0: y }]
			it.props.onTapStart(event, it.touches)
		}
	},
	touchstart(event, it) {
		if (it.props.isDisabled) return

		it.touches = makeTouches(event, it.touches)
		it.shouldIgnoreMouseEvents = true
		if (event.touches.length === 1) {
			it.isTouched = true
			initScrollDetection(it)
			setTapState(it, { isHovered: true, isPressed: true })

			if (it.props.onTapStart) it.props.onTapStart(event, it.touches)
		} else if (event.touches.length === 2 && it.props.isPinchable) {
			it.isPinching = true
			if (it.props.onTapEnd) it.props.onTapEnd(event, it.touches)
			if (it.props.onPinchStart) it.props.onPinchStart(event, it.touches)
		}
	},
	touchmove(event, it) {
		if (it.props.isDisabled) return

		it.touches = makeTouches(event, it.touches)
		if (it.isPinching) {
			if (it.props.onPinchMove) it.props.onPinchMove(event, it.touches)
		} else {
			if (detectScroll(it)) {
				endTouch(it)
				return
			}
			if (it.props.onTapMove) it.props.onTapMove(event, it.touches)
		}
	},
	touchend(event, it) {
		if (it.props.isDisabled) return

		it.touches = makeTouches(event, it.touches)
		if (event.touches.length === 0) {
			endTouch(it, event)
		} else if (event.touches.length === 1 && it.isPinching) {
			it.isPinching = false
			if (it.props.onPinchEnd) it.props.onPinchEnd(event, it.touches)
			if (it.props.onTapStart) it.props.onTapStart(event, it.touches)
		}
	},
	focus(event, it) {
		if (it.props.isDisabled) return
		// When focus somehow happened, but it should not
		if (it.props.shouldSetAttributes && !it.props.isFocusable) return
		if (it.shouldPreventFocus) {
			event.stopPropagation()
			it.shouldPreventFocus = false
		} else {
			setTapState(it, { isFocused: true })
			if (it.props.onFocus) it.props.onFocus(event)
		}
	},
	blur(event, it) {
		if (it.props.isDisabled) return
		setTapState(it, { isFocused: false })
		if (it.props.onBlur) it.props.onBlur(event)
	},
	keydown(event, it) {
		const { onTap, onTapStart, onTapEnd } = it.props
		const { isFocused } = it.state.tapState

		if (isFocused && event.keyCode === ENTER_KEYCODE) {
			setTapState(it, { isPressed: true })
			if (onTapStart) onTapStart(event)
			if (onTap) onTap(event)
			setTimeout(() => {
				setTapState(it, { isPressed: false })
				if (onTapEnd) onTapEnd(event)
			}, 150)
		}
	},
	click(event, it) {
		if (it.elem.tagName === 'BUTTON' && event.detail === 0) return
		if (it.props.isDisabled) return
		if (it.props.onTap) it.props.onTap(event)
	}
}

const setListeners = it => {
	Object.entries(handlers).forEach(([name, handler]) =>
		it.elem.addEventListener(name, event => handler(event, it))
	)
}

const setAttributes = it => {
	const { isDisabled, tabIndex, isFocusable } = it.props

	if (isDisabled) it.elem.setAttribute('disabled', 'disabled')
	else it.elem.removeAttribute('disabled')

	if (isFocusable && !isDisabled) it.elem.setAttribute('tabindex', tabIndex)
	else it.elem.removeAttribute('tabindex')
}

const Taply = forwardRef((props, ref) => {
	const it = useIt({
		initialState: {
			tapState: {
				isPressed: false,
				isHovered: false,
				isFocused: false
			}
		},
		initialCtx: () => ({
			elem: undefined,
			touches: [],
			isTouched: false,
			// Focus is prevented on click when `preventFocusOnTap` if `true`
			// and always prevented on touch
			shouldPreventFocus: false,
			// Ignore mouse events on touching because mousedown happens after touchend
			shouldIgnoreMouseEvents: false,
			unmounted: false // TODO test
		}),
		props
	})

	const elemRef = useRef()

	useEffect(
		() => {
			if (it.elem !== elemRef.current) {
				it.elem = elemRef.current
				if (it.elem instanceof Element) {
					setListeners(it)
					if (props.shouldSetAttributes) setAttributes(it)
				}
			} else {
				if (props.shouldSetAttributes) setAttributes(it)
			}
		},
		[elemRef.current, props.isDisabled]
	)

	useImperativeHandle(
		ref,
		() => ({
			focus() {
				if (it.elem instanceof Element) it.elem.focus()
			}
		}),
		[]
	)

	if (typeof props.children === 'function') {
		return props.children(it.state.tapState, elemRef)
	} else {
		return cloneElementWithRef(props.children, { ref: elemRef })
	}
})

Taply.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
	onTap: PropTypes.func,
	onChangeTapState: PropTypes.func,
	onTapStart: PropTypes.func,
	onTapMove: PropTypes.func,
	onTapEnd: PropTypes.func,
	onPinchStart: PropTypes.func,
	onPinchMove: PropTypes.func,
	onPinchEnd: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	isDisabled: PropTypes.bool,
	isPinchable: PropTypes.bool,
	preventFocusOnTap: PropTypes.bool,
	shouldSetAttributes: PropTypes.bool,
	isFocusable: PropTypes.bool,
	tabIndex: PropTypes.number
}

Taply.defaultProps = {
	shouldSetAttributes: true,
	isFocusable: true,
	tabIndex: 0,
	preventFocusOnTap: true,
	isPinchable: false
}

export default Taply
