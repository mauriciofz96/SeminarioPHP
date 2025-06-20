import React from 'react'
import { useNavigate } from 'react-router-dom'

function HeaderComponent() {
  const navigate = useNavigate()

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 p-4 flex items-center text-white">
  <img
    src="https://imgs.search.brave.com/jqabVh5NuJ-ytXMQLt-e87i0YvQHxDMeH977NgOBJsI/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9wdXJl/cG5nLmNvbS9wdWJs/aWMvdXBsb2Fkcy90/aHVtYm5haWwvL3B1/cmVwbmcuY29tLXBv/a2ViYWxscG9rZWJh/bGxkZXZpY2Vwb2tl/bW9uLWJhbGxwb2tl/bW9uLWNhcHR1cmUt/YmFsbC0xNzAxNTI3/ODI1ODc2cXZmcXUu/cG5n"
    alt="Pokebattle Logo"
    style={{ width: 48, height: 48, marginRight: 16 }}
  />
  <h1 className="text-2xl font-bold">Pokebattle</h1>
</header>
  )
}

export default HeaderComponent
