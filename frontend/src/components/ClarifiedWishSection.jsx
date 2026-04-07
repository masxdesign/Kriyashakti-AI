import SuggestionSlider from './SuggestionSlider.jsx'

export default function ClarifiedWishSection({ item, index }) {
  return (
    <section className="w-full max-w-2xl">
      <h3 className="text-sm font-semibold text-stone-600 mb-3">
        Wish {index + 1}: {item.wish}
      </h3>
      <SuggestionSlider options={item.options} visualizations={item.visualizations} />
    </section>
  )
}
