import { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

const ENTER_KEYCODE = 13

class Taply extends Component {
	static propTypes = {
		/** Single element. */
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,

		/** Tap event handler. */
		onTap: PropTypes.func,

		/**
		 * Handler of hovered and pressed states changes.
		 *
		 * `({hovered: boolean, pressed: boolean}) => void`
		 */
		onChangeTapState: PropTypes.func,

		/**
		 * `(tap: object) => void`
		 */
		onTapStart: PropTypes.func,

		/**
		 * `(tap: object) => void`
		 */
		onTapEnd: PropTypes.func,

		/**
		 * Focus event handler.
		 *
		 * `(event: object) => void`
		 */
		onFocus: PropTypes.func,

		/**
		 * Blur event handler.
		 *
		 * `(event: object) => void`
		 */
		onBlur: PropTypes.func,

		/** Disables events handling. */
		isDisabled: PropTypes.bool,

		isFocusable: PropTypes.bool,

		tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

		preventFocusOnTap: PropTypes.bool
	}

	static defaultProps = {
		isFocusable: true,
		tabIndex: 0,
		preventFocusOnTap: true
	}

	constructor(props) {
		super(props)

		this.onMouseUp = this.onMouseUp.bind(this)
		this.handlers = {
			mouseenter: this.onMouseEnter,
			mouseleave: this.onMouseLeave,
			mousedown: this.onMouseDown,
			touchstart: this.onTouchStart,
			touchmove: this.onTouchMove,
			touchend: this.onTouchEnd,
			click: this.onClick,
			focus: this.onFocus,
			blur: this.onBlur,
			keydown: this.onKeyDown,
			dragstart: this.onDragStart
		}
		Object.entries(this.handlers).forEach(([name, handler]) => {
			this.handlers[name] = handler.bind(this)
		})
	}

	state = {
		tapState: {
			isPressed: false,
			isHovered: false,
			isFocused: false
		}
	}

	isTouched = false // eslint-disable-line react/sort-comp

	// Focus is prevented on click when `preventFocusOnTap` if `true`
	// and always prevented on touch
	shouldPreventFocus = false

	// Ignore mouse events on touching because mousedown happens after touchend
	shouldIgnoreMouseEvents = false

	componentDidMount() {
		this.elem = ReactDOM.findDOMNode(this)
		this.bindHandlers(this.elem)
		this.setAttributes(this.elem)
	}

	componentDidUpdate(prevProps) {
		const elem = ReactDOM.findDOMNode(this)
		if (this.elem !== elem) {
			this.bindHandlers(elem)
			this.setAttributes(elem)
			this.elem = elem
		} else if (this.props.isDisabled !== prevProps.isDisabled) {
			this.setAttributes(this.elem)
		}
	}

	componentWillUnmount() {
		this.unmounted = false
	}

	onMouseEnter() {
		if (this.props.isDisabled) return
		if (this.shouldIgnoreMouseEvents) return
		this.setTapState({ isHovered: true })
	}

	onMouseLeave() {
		if (this.props.isDisabled) return
		if (this.shouldIgnoreMouseEvents) return
		this.setTapState({ isHovered: false })
	}

	onMouseDown(event) {
		if (this.props.isDisabled) return
		if (this.shouldIgnoreMouseEvents) {
			this.shouldIgnoreMouseEvents = false
			return
		}
		if (event.button !== 0) return
		document.addEventListener('mouseup', this.onMouseUp)
		this.setTapState({ isPressed: true })
		if (this.props.onTapStart) this.props.onTapStart(event)
	}

	onMouseUp(event) {
		document.removeEventListener('mouseup', this.onMouseUp)
		if (this.unmounted) return

		const rootElem = ReactDOM.findDOMNode(this)
		let isOnButton
		let elem = event.target
		while (elem) {
			if (elem === rootElem) {
				isOnButton = true
				break
			}
			elem = elem.parentElement
		}

		this.setTapState({ isPressed: false, isHovered: isOnButton })
		if (this.props.onTapEnd) this.props.onTapEnd(event)
	}

	onTouchStart(event) {
		if (this.props.isDisabled) return
		this.shouldIgnoreMouseEvents = true
		if (event.touches.length === 1) {
			this.isTouched = true
			this.initScrollDetection()
			this.setTapState({ isHovered: true, isPressed: true })
			if (this.props.onTapStart) this.props.onTapStart(event.touches[0])
		}
	}

	onTouchMove() {
		if (this.props.isDisabled) return
		if (this.detectScroll()) this.endTouch()
	}

	onTouchEnd(event) {
		if (this.props.isDisabled) return
		if (event.touches.length === 0) this.endTouch(event)
	}

	onFocus(event) {
		if (this.props.isDisabled) return
		if (!this.props.isFocusable || this.shouldPreventFocus) {
			event.stopPropagation()
			this.shouldPreventFocus = false
		} else {
			this.setTapState({ isFocused: true })
			if (this.props.onFocus) this.props.onFocus(event)
		}
	}

	onBlur(event) {
		if (this.props.isDisabled) return
		this.setTapState({ isFocused: false })
		if (this.props.onBlur) this.props.onBlur(event)
	}

	onKeyDown(event) {
		const { onTap, onTapStart, onTapEnd } = this.props
		const { isFocused } = this.state.tapState

		if (isFocused && event.keyCode === ENTER_KEYCODE) {
			this.setTapState({ isPressed: true })
			if (onTapStart) onTapStart()
			if (onTap) onTap()
			setTimeout(() => {
				this.setTapState({ isPressed: false })
				if (onTapEnd) onTapEnd()
			}, 150)
		}
	}

	onClick(event) {
		if (this.props.isDisabled) return
		if (this.props.onTap) this.props.onTap(event)
	}

	onDragStart() {
		this.setTapState({ isHovered: false, isPressed: false })
	}

	setTapState(tapState) {
		if (tapState.isPressed && (this.props.preventFocusOnTap || this.isTouched)) {
			this.shouldPreventFocus = true
		}

		const nextTapState = { ...this.state.tapState, ...tapState }
		this.setState({ tapState: nextTapState })
		if (this.props.onChangeTapState) this.props.onChangeTapState(nextTapState)
	}

	setAttributes(elem) {
		const { isDisabled, tabIndex, isFocusable } = this.props

		if (isDisabled) elem.setAttribute('disabled', 'disabled')
		else elem.removeAttribute('disabled')

		if (isFocusable && !isDisabled) elem.setAttribute('tabindex', tabIndex)
		else elem.removeAttribute('tabindex')
	}

	bindHandlers(elem) {
		Object.entries(this.handlers).forEach(([name, handler]) =>
			elem.addEventListener(name, handler)
		)
	}

	endTouch(event) {
		this.isTouched = false
		this.setTapState({ isHovered: false, isPressed: false })
		if (this.props.onTapEnd) this.props.onTapEnd(event)
	}

	initScrollDetection() {
		this.scrollPos = { top: 0, left: 0 }
		this.scrollParents = []
		let node = ReactDOM.findDOMNode(this)
		while (node) {
			if (
				node.scrollHeight > node.offsetHeight ||
				node.scrollWidth > node.offsetWidth
			) {
				this.scrollParents.push(node)
				this.scrollPos.top += node.scrollTop
				this.scrollPos.left += node.scrollLeft
			}
			node = node.parentNode
		}
	}

	detectScroll() {
		const currentScrollPos = { top: 0, left: 0 }
		this.scrollParents.forEach(elem => {
			currentScrollPos.top += elem.scrollTop
			currentScrollPos.left += elem.scrollLeft
		})
		return (
			currentScrollPos.top !== this.scrollPos.top ||
			currentScrollPos.left !== this.scrollPos.left
		)
	}

	focus() {
		ReactDOM.findDOMNode(this).focus()
	}

	render() {
		const { children } = this.props
		return typeof children === 'function' ? children(this.state.tapState) : children
	}
}

export default Taply
