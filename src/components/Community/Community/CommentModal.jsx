                    <Smiley size={20} className="cursor-pointer"/>
                  </button>
                  <p className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out whitespace-nowrap pointer-events-none">Add emoji</p>
                </div>
                {showEmojiPicker && (
                  <div className="absolute left-0 bottom-10 z-20">
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiClick}
                      theme="light"
                      previewPosition="none"
                    />
                  </div>
                )}
              </div>
              
              <div className="relative group cursor-pointer">
                <button
                  type="submit"
                  disabled={!comment.trim() || isLoading}
                  className="ml-2 cursor-pointer text-gray-400 hover:text-primary disabled:opacity-50"
                >
                  <PaperPlaneRight size={22} />
                </button>
                <p className="absolute -top-8.5 -right-7.5 bg-gray-600 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out whitespace-nowrap pointer-events-none">Send comment</p>
              </div> 